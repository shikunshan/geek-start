require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
// Behind nginx reverse proxy: trust first hop so rate limiting sees real client IPs
app.set('trust proxy', 1);

// CORS: same-origin by default; set ALLOWED_ORIGINS (comma-separated) to allow cross-origin access
if (process.env.ALLOWED_ORIGINS) {
  const origins = process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
  app.use(cors({ origin: origins }));
}

app.use(compression());
app.use(express.json({ limit: '1mb' }));

// Static files: whitelist only, never the repo root (.env, node_modules etc. must NOT be reachable)
const staticOpts = { maxAge: '1h', etag: true };
const assetOpts = { maxAge: '30d', immutable: true };
app.use('/js', express.static(path.join(__dirname, 'js'), staticOpts));
app.use('/css', express.static(path.join(__dirname, 'css'), staticOpts));
app.use('/assets', express.static(path.join(__dirname, 'assets'), assetOpts));
app.use('/public', express.static(path.join(__dirname, 'public'), assetOpts));
app.use('/config', express.static(path.join(__dirname, 'config'), staticOpts));
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'index.html'));
});

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

// Rate limit the chat proxy so strangers can't burn LLM credits
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: parseInt(process.env.CHAT_RATE_LIMIT, 10) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过于频繁，请稍后再试' }
});

app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { messages, stream = true } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required' });
    }

    if (!LLM_API_KEY || LLM_API_KEY === 'your-api-key-here') {
      return res.status(500).json({
        error: 'LLM_API_KEY not configured',
        hint: '请在 .env 文件中配置 LLM_API_KEY'
      });
    }

    const requestMessages = [];
    if (LLM_SYSTEM_PROMPT) {
      requestMessages.push({ role: 'system', content: LLM_SYSTEM_PROMPT });
    }
    requestMessages.push(...messages);

    // Abort the upstream request if the client disconnects (saves tokens)
    const upstreamAbort = new AbortController();
    req.on('close', () => {
      if (!res.writableEnded) upstreamAbort.abort();
    });

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
      }),
      signal: upstreamAbort.signal
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
      res.flushHeaders();

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
            // Skip malformed SSE chunks (partial JSON split across reads)
            console.warn('Skipping malformed SSE chunk:', data.slice(0, 80));
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
    if (error.name === 'AbortError') {
      // Client disconnected mid-stream; nothing to send back
      return;
    }
    console.error('Chat API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end();
    }
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
