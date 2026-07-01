const AIManager = {
  isInChatMode: false,
  messages: [],
  currentAiLine: null,
  isGenerating: false,
  abortController: null,

  config: {
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'Qwen/Qwen2.5-7B-Instruct'
  },

  init() {
    const saved = Storage.get('ai_config', null);
    if (saved) {
      this.config = { ...this.config, ...saved };
    }
  },

  saveConfig() {
    Storage.set('ai_config', this.config);
  },

  enterChatMode() {
    this.isInChatMode = true;
    this.messages = [];
    Terminal.println('🤖 已进入 AI 对话模式，输入消息开始对话', 'success');
    Terminal.println('   /exit 退出对话  |  /clear 清空上下文  |  Ctrl+C 中断生成', 'dim');
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
      await this.chatWithProxy();
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

  handleSlashCommand(cmd) {
    const parts = cmd.split(/\s+/);
    const command = parts[0].toLowerCase();

    switch (command) {
      case '/exit':
      case '/quit':
        this.exitChatMode();
        return true;

      case '/clear':
        this.clearContext();
        return true;

      default:
        return false;
    }
  },

  getStatus() {
    return {
      model: this.config.model,
      baseUrl: this.config.baseUrl,
      inChatMode: this.isInChatMode,
      messageCount: this.messages.length,
      isGenerating: this.isGenerating
    };
  }
};

CommandRegistry.register({
  name: 'ai',
  alias: [],
  description: 'AI 对话助手',
  usage: 'ai [status]',
  handler: async (args) => {
    if (args.length === 0) {
      AIManager.enterChatMode();
      return;
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === 'status') {
      const status = AIManager.getStatus();
      Terminal.println('当前状态:', 'info');
      Terminal.println(`  模型: ${status.model}`, '');
      Terminal.println(`  接口地址: ${status.baseUrl}`, '');
      Terminal.println(`  对话中: ${status.inChatMode ? '是' : '否'}`, '');
      return;
    }

    AIManager.enterChatMode();
    setTimeout(() => AIManager.sendMessage(args.join(' ')), 100);
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
