const Terminal = {
  outputEl: null,
  inputTextEl: null,
  cursorEl: null,
  hiddenInput: null,
  containerEl: null,

  history: [],
  historyIndex: -1,
  currentInput: '',
  isProcessing: false,
  inputCallback: null,
  inputInterceptor: null,
  interruptHandlers: [],
  scrollPending: false,

  MAX_OUTPUT_LINES: 2000,

  init() {
    this.outputEl = document.getElementById('terminal-output');
    this.inputTextEl = document.getElementById('input-text');
    this.cursorEl = document.getElementById('cursor');
    this.hiddenInput = document.getElementById('hidden-input');
    this.containerEl = document.getElementById('terminal-container');

    this.history = Storage.get('history', []);
    this.historyIndex = this.history.length;

    this.bindEvents();
    this.focus();
  },

  bindEvents() {
    document.addEventListener('click', () => this.focus());

    this.hiddenInput.addEventListener('input', (e) => {
      this.currentInput = e.target.value;
      this.updateInputDisplay();
    });

    this.hiddenInput.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });
  },

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.submitInput();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigateHistory(1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.handleTab();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.clear();
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      this.handleCtrlC();
    }
  },

  submitInput() {
    const input = this.currentInput.trim();
    if (input === '') {
      this.printPrompt();
      return;
    }

    this.addToHistory(input);

    this.currentInput = '';
    this.hiddenInput.value = '';
    this.updateInputDisplay();
    this.historyIndex = this.history.length;

    if (this.inputInterceptor) {
      const intercepted = this.inputInterceptor(input);
      if (intercepted === true) {
        return;
      }
    }

    this.printPromptWithInput(input);

    if (this.inputCallback) {
      this.inputCallback(input);
    }
  },

  navigateHistory(direction) {
    if (this.history.length === 0) return;

    const newIndex = this.historyIndex + direction;

    if (newIndex < 0) {
      this.historyIndex = 0;
    } else if (newIndex >= this.history.length) {
      this.historyIndex = this.history.length;
      this.currentInput = '';
    } else {
      this.historyIndex = newIndex;
      this.currentInput = this.history[this.historyIndex];
    }

    this.hiddenInput.value = this.currentInput;
    this.updateInputDisplay();
  },

  handleTab() {
    if (!this.currentInput || this.currentInput.includes(' ')) return;

    const matches = CommandRegistry.complete(this.currentInput);
    if (matches.length === 1) {
      this.currentInput = matches[0] + ' ';
      this.hiddenInput.value = this.currentInput;
      this.updateInputDisplay();
    } else if (matches.length > 1) {
      this.printPromptWithInput(this.currentInput);
      this.println(matches.join('  '), 'dim');
    }
  },

  handleCtrlC() {
    // Let running tasks (animations, AI generation) stop themselves first
    if (this.interruptHandlers.length > 0) {
      const handlers = [...this.interruptHandlers];
      this.interruptHandlers = [];
      handlers.forEach(fn => {
        try { fn(); } catch (e) { console.error('interrupt handler error:', e); }
      });
    }

    this.println('^C', 'error');
    this.currentInput = '';
    this.hiddenInput.value = '';
    this.updateInputDisplay();
    this.historyIndex = this.history.length;

    this.printPrompt();
  },

  // Register a callback invoked on Ctrl+C; returns an unregister function
  onInterrupt(fn) {
    this.interruptHandlers.push(fn);
    return () => {
      this.interruptHandlers = this.interruptHandlers.filter(h => h !== fn);
    };
  },

  addToHistory(cmd) {
    if (this.history[this.history.length - 1] !== cmd) {
      this.history.push(cmd);
      if (this.history.length > 100) {
        this.history.shift();
      }
      Storage.set('history', this.history);
    }
  },

  updateInputDisplay() {
    this.inputTextEl.textContent = this.currentInput;
  },

  println(text, className = '') {
    const line = document.createElement('div');
    line.className = 'line ' + className;
    if (typeof text === 'string') {
      line.innerHTML = text === '' ? '&nbsp;' : Utils.escapeHtml(text);
    } else if (text instanceof HTMLElement) {
      line.appendChild(text);
    }
    this.appendLine(line);
  },

  // Print an info title followed by an indented list of items (shared by many commands)
  printList(title, items) {
    this.println(title, 'info');
    items.forEach(item => this.println(`  ${item}`, ''));
  },

  printPrompt() {
    this.println('', '');
  },

  printPromptWithInput(input) {
    this.println('', '');
    const line = document.createElement('div');
    line.className = 'line prompt-line';
    line.innerHTML = `<span style="color: var(--prompt-color);">&gt;</span> <span>${Utils.escapeHtml(input)}</span>`;
    this.appendLine(line);
  },

  printHtml(html, className = '') {
    const line = document.createElement('div');
    line.className = 'line ' + className;
    line.innerHTML = html;
    this.appendLine(line);
  },

  // Append a line, cap total output size, and schedule a scroll
  appendLine(line) {
    this.outputEl.appendChild(line);
    while (this.outputEl.childElementCount > this.MAX_OUTPUT_LINES) {
      this.outputEl.removeChild(this.outputEl.firstElementChild);
    }
    this.scrollToBottom();
  },

  clear() {
    this.outputEl.innerHTML = '';
  },

  focus() {
    this.hiddenInput.focus();
  },

  // Batched via rAF so rapid output (e.g. AI streaming) forces at most one layout per frame
  scrollToBottom() {
    if (this.scrollPending) return;
    this.scrollPending = true;
    requestAnimationFrame(() => {
      this.scrollPending = false;
      this.containerEl.scrollTop = this.containerEl.scrollHeight;
    });
  },

  onInput(callback) {
    this.inputCallback = callback;
  },

  getHistory() {
    return [...this.history];
  }
};

const GeekStart = {
  async init() {
    const config = Storage.get('config', null);
    if (!config) {
      try {
        const response = await fetch('config/default.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const defaults = await response.json();
        Storage.set('config', defaults);
      } catch (e) {
        Storage.set('config', {
          username: 'geek',
          defaultSearch: 'google',
          theme: 'default'
        });
      }
    }

    Terminal.init();
    BackgroundManager.init();
    MusicPlayer.init();
    ThemeManager.init();

    Terminal.onInput((input) => {
      CommandRegistry.execute(input);
    });

    this.showWelcome();
  },

  showWelcome() {
    const config = Storage.get('config', {});
    const username = config.username || 'geek';

    Terminal.println('');
    Utils.ASCII_BANNER.forEach(line => Terminal.println(`  ${line}`, 'info'));
    Terminal.println('');

    Terminal.println(`欢迎回来，${username}！`, 'success');
    Terminal.println('');
    Terminal.println('输入 help 查看所有可用命令', 'dim');
    Terminal.println('快捷键: ↑↓ 浏览历史 | Tab 自动补全 | Ctrl+L 清屏', 'dim');
  }
};
