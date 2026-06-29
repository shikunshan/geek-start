const ConfigManager = {
  defaults: {
    username: 'geek',
    defaultSearch: 'google',
    theme: 'default',
    backgroundInterval: 30000,
    soundEnabled: false
  },

  get() {
    const saved = Storage.get('config', {});
    return { ...this.defaults, ...saved };
  },

  set(key, value) {
    const config = this.get();

    if (!(key in this.defaults)) {
      return { success: false, message: `未知配置项: ${key}` };
    }

    if (key === 'backgroundInterval') {
      const num = parseInt(value);
      if (isNaN(num) || num < 1000) {
        return { success: false, message: 'backgroundInterval 必须是大于等于 1000 的数字（毫秒）' };
      }
      config[key] = num;
    } else if (key === 'soundEnabled') {
      config[key] = value === 'true' || value === '1' || value === 'yes';
    } else {
      config[key] = value;
    }

    Storage.set('config', config);
    return { success: true };
  },

  reset() {
    Storage.set('config', { ...this.defaults });
    ThemeManager.setTheme(this.defaults.theme);
  }
};

CommandRegistry.register({
  name: 'config',
  alias: ['cfg'],
  description: '配置管理',
  usage: 'config [set <key> <value>|reset|list]',
  handler: async (args) => {
    if (args.length === 0 || args[0] === 'list' || args[0] === 'ls') {
      const config = ConfigManager.get();
      Terminal.println('当前配置:', 'info');
      Terminal.println('');
      Object.entries(config).forEach(([key, value]) => {
        Terminal.println(`  ${key} = ${value}`, '');
      });
      Terminal.println('');
      Terminal.println('使用 config set <key> <value> 修改配置', 'dim');
      return;
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === 'set') {
      if (args.length < 3) {
        Terminal.println('用法: config set <key> <value>', 'error');
        return;
      }
      const key = args[1];
      const value = args.slice(2).join(' ');
      const result = ConfigManager.set(key, value);
      if (result.success) {
        Terminal.println(`已设置 ${key} = ${value}`, 'success');
        if (key === 'theme') {
          ThemeManager.setTheme(value);
        }
      } else {
        Terminal.println(result.message, 'error');
      }
      return;
    }

    if (subCmd === 'reset') {
      ConfigManager.reset();
      Terminal.println('已重置为默认配置', 'success');
      return;
    }

    Terminal.println(`未知子命令: ${subCmd}`, 'error');
  }
});
