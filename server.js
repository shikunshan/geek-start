require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '.')));

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-3.5-turbo';
const LLM_SYSTEM_PROMPT = process.env.LLM_SYSTEM_PROMPT || '';

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!LLM_API_KEY && LLM_API_KEY !== 'your-api-key-here',
    model: LLM_MODEL,
    baseUrl: LLM_BASE_URL
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, stream = true } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required' });
    }

    if (!LLM_API_KEY || LLM_API_KEY === 'your-api-key-here') {
      return res.status(500).json({ 
        error: 'LLM_API_KEY not configured',
        hint: '请在 .env 文件中配置 LLM_API_KEY，或在前端使用 ai setkey 命令设置 API Key'
      });
    }

    const requestMessages = [];
    if (LLM_SYSTEM_PROMPT) {
      requestMessages.push({ role: 'system', content: LLM_SYSTEM_PROMPT });
    }
    requestMessages.push(...messages);

    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: requestMessages,
        stream: stream
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      res.json({ content });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   GeekStart Server Running               ║
  ║                                          ║
  ║   🚀  http://localhost:${PORT}            ║
  ║   🤖  API: /api/chat                     ║
  ║   💚  Health: /api/health                ║
  ╚══════════════════════════════════════════╝
  `);
});
