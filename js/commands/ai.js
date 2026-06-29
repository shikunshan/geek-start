const AIManager = {
  isInChatMode: false,
  messages: [],
  currentAiLine: null,
  isGenerating: false,
  abortController: null,

  config: {
    mode: 'proxy',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    systemPrompt: ''
  },

  init() {
    const saved = Storage.get('ai_config', null);
    if (saved) {
      this.config = { ...this.config, ...saved };
    }
  },

  saveConfig() {
    Storage.set('ai_config', {
      mode: this.config.mode,
      apiKey: this.config.apiKey,
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      systemPrompt: this.config.systemPrompt
    });
  },

  enterChatMode() {
    this.isInChatMode = true;
    this.messages = [];
    Terminal.println('🤖 已进入 AI 对话模式，输入消息开始对话', 'success');
    Terminal.println('   输入 /exit 退出对话 | /clear 清空上下文 | /help 查看帮助', 'dim');
    Terminal.println('');
  },

  exitChatMode() {
    this.isInChatMode = false;
    this.messages = [];
    this.isGenerating = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    Terminal.println('');
    Terminal.println('已退出 AI 对话模式', 'info');
  },

  clearContext() {
    this.messages = [];
    Terminal.println('已清空对话上下文', 'info');
  },

  async sendMessage(userMessage) {
    if (this.isGenerating) {
      Terminal.println('AI 正在思考中，请稍候...', 'warning');
      return;
    }

    this.messages.push({ role: 'user', content: userMessage });

    Terminal.printHtml(`<div class="line"><span style="color: var(--info-color);">你:</span> ${Utils.escapeHtml(userMessage)}</div>`);

    this.isGenerating = true;
    this.currentAiLine = null;

    const aiLine = document.createElement('div');
    aiLine.className = 'line';
    aiLine.innerHTML = '<span style="color: var(--success-color);">AI:</span> <span class="ai-content"></span>';
    Terminal.outputEl.appendChild(aiLine);
    this.currentAiLine = aiLine.querySelector('.ai-content');
    Terminal.scrollToBottom();

    try {
      this.abortController = new AbortController();

      if (this.config.mode === 'proxy') {
        await this.chatWithProxy();
      } else {
        await this.chatDirect();
      }

      const aiContent = this.currentAiLine.textContent;
      this.messages.push({ role: 'assistant', content: aiContent });

    } catch (error) {
      if (error.name === 'AbortError') {
        this.currentAiLine.innerHTML += ' <span style="color: var(--warning-color);">[已中断]</span>';
      } else {
        Terminal.println(`错误: ${error.message}`, 'error');
        this.messages.pop();
      }
    } finally {
      this.isGenerating = false;
      this.abortController = null;
      Terminal.println('');
    }
  },

  async chatWithProxy() {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: this.messages,
        stream: true
      }),
      signal: this.abortController?.signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(err.error || err.message || `HTTP ${response.status}`);
    }

    await this.processStream(response);
  },

  async chatDirect() {
    if (!this.config.apiKey) {
      throw new Error('未配置 API Key，请使用 ai setkey <key> 设置');
    }

    const requestMessages = [];
    if (this.config.systemPrompt) {
      requestMessages.push({ role: 'system', content: this.config.systemPrompt });
    }
    requestMessages.push(...this.messages);

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: requestMessages,
        stream: true
      }),
      signal: this.abortController?.signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(err.error?.message || err.message || `HTTP ${response.status}`);
    }

    await this.processStream(response);
  },

  async processStream(response) {
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
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.content || parsed.choices?.[0]?.delta?.content;
          if (content && this.currentAiLine) {
            this.currentAiLine.textContent += content;
            Terminal.scrollToBottom();
          }
        } catch (e) {
        }
      }
    }
  },

  setMode(mode) {
    if (mode !== 'proxy' && mode !== 'direct') {
      return { success: false, message: '模式只能是 proxy 或 direct' };
    }
    this.config.mode = mode;
    this.saveConfig();
    return { success: true };
  },

  setApiKey(key) {
    this.config.apiKey = key;
    this.saveConfig();
  },

  setBaseUrl(url) {
    this.config.baseUrl = url;
    this.saveConfig();
  },

  setModel(model) {
    this.config.model = model;
    this.saveConfig();
  },

  setSystemPrompt(prompt) {
    this.config.systemPrompt = prompt;
    this.saveConfig();
  },

  getStatus() {
    return {
      mode: this.config.mode,
      model: this.config.model,
      baseUrl: this.config.baseUrl,
      hasApiKey: !!this.config.apiKey,
      inChatMode: this.isInChatMode,
      messageCount: this.messages.length,
      isGenerating: this.isGenerating
    };
  },

  handleSlashCommand(cmd) {
    const parts = cmd.split(/\s+/);
    const command = parts[0].toLowerCase();

    switch (command) {
      case '/exit':
      case '/quit':
      case '/q':
        this.exitChatMode();
        return true;

      case '/clear':
      case '/reset':
        this.clearContext();
        return true;

      case '/help':
      case '/?':
        Terminal.println('');
        Terminal.println('AI 对话模式命令:', 'info');
        Terminal.println('  /exit, /quit, /q  - 退出对话模式', 'dim');
        Terminal.println('  /clear, /reset   - 清空对话上下文', 'dim');
        Terminal.println('  /help, /?        - 显示此帮助', 'dim');
        Terminal.println('  /status          - 查看当前配置状态', 'dim');
        Terminal.println('  Ctrl+C           - 中断生成', 'dim');
        Terminal.println('');
        return true;

      case '/status':
        const status = this.getStatus();
        Terminal.println('');
        Terminal.println('当前状态:', 'info');
        Terminal.println(`  模式: ${status.mode}`, 'dim');
        Terminal.println(`  模型: ${status.model}`, 'dim');
        Terminal.println(`  上下文消息数: ${status.messageCount}`, 'dim');
        Terminal.println(`  生成中: ${status.isGenerating ? '是' : '否'}`, 'dim');
        Terminal.println('');
        return true;

      default:
        return false;
    }
  }
};

CommandRegistry.register({
  name: 'ai',
  alias: ['chat', 'gpt'],
  description: 'AI 对话助手',
  usage: 'ai [start|status|setkey <key>|setmodel <model>|seturl <url>|setmode <proxy|direct>]',
  handler: async (args) => {
    if (args.length === 0) {
      AIManager.enterChatMode();
      return;
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === 'start' || subCmd === 'chat') {
      AIManager.enterChatMode();
      return;
    }

    if (subCmd === 'exit' || subCmd === 'quit') {
      AIManager.exitChatMode();
      return;
    }

    if (subCmd === 'status') {
      const status = AIManager.getStatus();
      Terminal.println('AI 配置状态:', 'info');
      Terminal.println(`  模式: ${status.mode}`, '');
      Terminal.println(`  模型: ${status.model}`, '');
      Terminal.println(`  接口地址: ${status.baseUrl}`, '');
      Terminal.println(`  API Key: ${status.hasApiKey ? '已配置' : '未配置'}`, status.hasApiKey ? 'success' : 'warning');
      Terminal.println(`  对话中: ${status.inChatMode ? '是' : '否'}`, '');
      return;
    }

    if (subCmd === 'setkey') {
      if (args.length < 2) {
        Terminal.println('用法: ai setkey <your-api-key>', 'error');
        return;
      }
      const key = args.slice(1).join(' ').trim();
      AIManager.setApiKey(key);
      Terminal.println('API Key 已保存', 'success');
      return;
    }

    if (subCmd === 'setmodel') {
      if (args.length < 2) {
        Terminal.println('用法: ai setmodel <model-name>', 'error');
        return;
      }
      AIManager.setModel(args[1]);
      Terminal.println(`模型已设置为: ${args[1]}`, 'success');
      return;
    }

    if (subCmd === 'seturl') {
      if (args.length < 2) {
        Terminal.println('用法: ai seturl <base-url>', 'error');
        return;
      }
      AIManager.setBaseUrl(args[1]);
      Terminal.println(`接口地址已设置为: ${args[1]}`, 'success');
      return;
    }

    if (subCmd === 'setmode') {
      if (args.length < 2) {
        Terminal.println('用法: ai setmode <proxy|direct>', 'error');
        return;
      }
      const result = AIManager.setMode(args[1]);
      if (result.success) {
        Terminal.println(`模式已切换为: ${args[1]}`, 'success');
      } else {
        Terminal.println(result.message, 'error');
      }
      return;
    }

    if (subCmd === 'setsystem') {
      if (args.length < 2) {
        Terminal.println('用法: ai setsystem <system-prompt>', 'error');
        return;
      }
      const prompt = args.slice(1).join(' ');
      AIManager.setSystemPrompt(prompt);
      Terminal.println('系统提示词已设置', 'success');
      return;
    }

    if (subCmd === 'clear') {
      AIManager.clearContext();
      return;
    }

    const question = args.join(' ');
    AIManager.enterChatMode();
    setTimeout(() => AIManager.sendMessage(question), 100);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  AIManager.init();

  Terminal.inputInterceptor = function(input) {
    if (AIManager.isInChatMode) {
      if (AIManager.isGenerating && input.trim() === '') {
        return true;
      }
      if (input.startsWith('/')) {
        const handled = AIManager.handleSlashCommand(input);
        if (handled) return true;
      }
      AIManager.sendMessage(input);
      return true;
    }
    return false;
  };
});
