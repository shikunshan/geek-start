const ThemeManager = {
  themes: ['default', 'nord', 'dracula', 'gruvbox', 'monokai'],

  setTheme(name) {
    if (!this.themes.includes(name)) {
      return false;
    }

    // Remove only theme-* classes, preserving anything else on <body>
    [...document.body.classList]
      .filter(cls => cls.startsWith('theme-'))
      .forEach(cls => document.body.classList.remove(cls));
    document.body.classList.add(`theme-${name}`);
    Storage.set('theme', name);
    return true;
  },

  getCurrentTheme() {
    return Storage.get('theme', 'default');
  },

  listThemes() {
    return [...this.themes];
  },

  init() {
    const savedTheme = this.getCurrentTheme();
    if (savedTheme && this.themes.includes(savedTheme)) {
      this.setTheme(savedTheme);
    }
  }
};

CommandRegistry.register({
  name: 'theme',
  alias: ['t'],
  description: '切换主题',
  usage: 'theme [名称]',
  handler: async (args) => {
    if (args.length === 0) {
      const current = ThemeManager.getCurrentTheme();
      Terminal.println('当前状态:', 'info');
      Terminal.println(`  当前主题: ${current}`, '');
      Terminal.println('');
      Terminal.printList('可用主题:', ThemeManager.listThemes());
      Terminal.println('');
      Terminal.println('用法: theme <名称>', 'dim');
      return;
    }

    const arg = args[0].toLowerCase();

    if (arg === 'list' || arg === 'ls') {
      Terminal.printList('可用主题:', ThemeManager.listThemes());
      return;
    }

    const success = ThemeManager.setTheme(arg);
    if (success) {
      Terminal.println(`已切换主题: ${arg}`, 'success');
    } else {
      Terminal.println(`找不到主题: ${arg}`, 'error');
      Terminal.println(`可用: ${ThemeManager.listThemes().join(', ')}`, 'dim');
    }
  }
});
