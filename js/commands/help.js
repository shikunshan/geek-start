CommandRegistry.register({
  name: 'help',
  alias: ['?', 'h'],
  description: '显示所有可用命令',
  usage: 'help [command]',
  handler: async (args) => {
    if (args.length > 0) {
      const cmd = CommandRegistry.findByName(args[0].toLowerCase());
      if (cmd) {
        Terminal.println(`命令: ${cmd.name}`, 'info');
        if (cmd.alias && cmd.alias.length > 0) {
          Terminal.println(`别名: ${cmd.alias.join(', ')}`, 'dim');
        }
        Terminal.println(`描述: ${cmd.description}`, '');
        Terminal.println(`用法: ${cmd.usage}`, 'warning');
      } else {
        Terminal.println(`command not found: ${args[0]}`, 'error');
      }
      return;
    }

    Terminal.println('可用命令列表:', 'info');
    Terminal.println('');

    const commands = CommandRegistry.list().sort((a, b) => a.name.localeCompare(b.name));

    commands.forEach(cmd => {
      const aliasStr = cmd.alias && cmd.alias.length > 0
        ? `<span class="help-alias">[${cmd.alias.join(', ')}]</span>`
        : '';
      Terminal.printHtml(
        `<div class="help-item">` +
        `<span class="help-name">${cmd.name}</span>` +
        `<span class="help-desc">${cmd.description} ${aliasStr}</span>` +
        `</div>`
      );
    });

    Terminal.println('');
    Terminal.println('提示: 使用 help <命令名> 查看详细用法', 'dim');
    Terminal.println('快捷键: ↑↓ 历史命令 | Tab 自动补全 | Ctrl+L 清屏 | Ctrl+C 取消', 'dim');
  }
});

CommandRegistry.register({
  name: 'clear',
  alias: ['cls'],
  description: '清屏',
  usage: 'clear',
  handler: async () => {
    Terminal.clear();
  }
});

CommandRegistry.register({
  name: 'history',
  alias: ['hist'],
  description: '显示命令历史',
  usage: 'history [count]',
  handler: async (args) => {
    const history = Terminal.getHistory();
    let count = history.length;

    if (args.length > 0) {
      const n = parseInt(args[0]);
      if (!isNaN(n) && n > 0) {
        count = Math.min(n, history.length);
      }
    }

    const start = history.length - count;
    const display = history.slice(start);

    if (display.length === 0) {
      Terminal.println('暂无命令历史', 'dim');
      return;
    }

    display.forEach((cmd, i) => {
      const num = Utils.padLeft(start + i + 1, 4, ' ');
      Terminal.println(`  ${num}  ${cmd}`, '');
    });
  }
});
