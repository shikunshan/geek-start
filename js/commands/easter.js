const EasterEggs = {
  fortunes: [
    '代码写得好，bug 自然少',
    '今天适合重构代码',
    '记得写单元测试',
    '咖啡是程序员的血液',
    'Stack Overflow 是最好的老师',
    '不要在深夜部署生产环境',
    '先让代码跑起来，再优化',
    '命名是最难的问题',
    '注释要写，但不要太多',
    '保持代码简洁',
    '每一行代码都是给未来自己的信',
    '善用搜索引擎',
    '休息一下，再回来调试',
    '好的代码是最好的文档',
    '版本控制救过很多人命'
  ],

  cowsay(text) {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map(l => l.length));
    const top = ' ' + '_'.repeat(maxLen + 2);
    const bottom = ' ' + '-'.repeat(maxLen + 2);
    
    let bubble = '';
    if (lines.length === 1) {
      bubble = `< ${text} >`;
    } else {
      lines.forEach((line, i) => {
        const padded = line.padEnd(maxLen, ' ');
        if (i === 0) {
          bubble += `/ ${padded} \\\n`;
        } else if (i === lines.length - 1) {
          bubble += `\\ ${padded} /`;
        } else {
          bubble += `| ${padded} |\n`;
        }
      });
    }

    const cow = `
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;

    return top + '\n' + bubble + '\n' + bottom + cow;
  },

  slFrames: [
    `
     <a>
    /___\\_
  O]====[O
  /_|__|_\\
    `,
    `
      <a>
     /___\\_
   O]====[O
   /_|__|_\\
    `,
    `
       <a>
      /___\\_
    O]====[O
    /_|__|_\\
    `
  ]
};

CommandRegistry.register({
  name: 'sudo',
  alias: [],
  description: '以超级用户权限执行命令',
  usage: 'sudo <command>',
  handler: async (args) => {
    const fullCmd = args.join(' ');
    if (fullCmd === 'rm -rf /') {
      Terminal.println('Password: ', '');
      setTimeout(() => {
        Terminal.println('Permission denied (nice try)', 'error');
      }, 500);
    } else {
      Terminal.println(`${args.join(' ')}: Permission denied`, 'error');
    }
  }
});

CommandRegistry.register({
  name: 'fortune',
  alias: [],
  description: '随机显示一句格言',
  usage: 'fortune',
  handler: async () => {
    const fortune = Utils.randomFromArray(EasterEggs.fortunes);
    Terminal.println(fortune, 'success');
  }
});

CommandRegistry.register({
  name: 'sl',
  alias: [],
  description: '小火车动画',
  usage: 'sl',
  handler: async () => {
    Terminal.println('Choo choo! 🚂', 'info');
    
    let frame = 0;
    const totalFrames = 20;
    const interval = setInterval(() => {
      Terminal.println(EasterEggs.slFrames[frame % 3], 'warning');
      frame++;
      if (frame >= totalFrames) {
        clearInterval(interval);
      }
    }, 200);
  }
});

CommandRegistry.register({
  name: 'yes',
  alias: [],
  description: '重复输出 yes',
  usage: 'yes [text]',
  handler: async (args) => {
    const text = args.length > 0 ? args.join(' ') : 'y';
    let count = 0;
    const maxLines = 20;
    
    const interval = setInterval(() => {
      Terminal.println(text, '');
      count++;
      if (count >= maxLines) {
        clearInterval(interval);
        Terminal.println('... (已停止，按 Ctrl+C 可中断)', 'dim');
      }
    }, 100);
  }
});

CommandRegistry.register({
  name: 'cowsay',
  alias: [],
  description: '牛说点什么',
  usage: 'cowsay <message>',
  handler: async (args) => {
    const message = args.length > 0 ? args.join(' ') : 'Hello, Geek!';
    const cow = EasterEggs.cowsay(message);
    Terminal.printHtml(`<pre class="ascii-art" style="color: var(--success-color);">${cow}</pre>`);
  }
});

CommandRegistry.register({
  name: 'echo',
  alias: [],
  description: '回显文字',
  usage: 'echo <text>',
  handler: async (args) => {
    Terminal.println(args.join(' '), '');
  }
});

CommandRegistry.register({
  name: 'matrix',
  alias: [],
  description: 'Matrix 数字雨效果',
  usage: 'matrix',
  handler: async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const columns = 40;
    const lines = 15;
    
    Terminal.println('启动 Matrix 模式...', 'success');
    
    let count = 0;
    const interval = setInterval(() => {
      let line = '';
      for (let i = 0; i < columns; i++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      Terminal.println(line, 'success');
      count++;
      if (count >= lines) {
        clearInterval(interval);
        Terminal.println('Wake up, Neo...', 'warning');
      }
    }, 100);
  }
});

CommandRegistry.register({
  name: 'exit',
  alias: ['quit', 'q'],
  description: '退出（其实是开玩笑的）',
  usage: 'exit',
  handler: async () => {
    Terminal.println('哈哈哈，你以为能退出浏览器吗？ 😄', 'warning');
    Terminal.println('试试 help 看看有什么命令', 'dim');
  }
});

CommandRegistry.register({
  name: 'hack',
  alias: [],
  description: '模拟黑客入侵',
  usage: 'hack',
  handler: async () => {
    const messages = [
      '正在建立连接...',
      '绕过防火墙...',
      '破解密码... [#######     ] 50%',
      '破解密码... [##########  ] 80%',
      '破解密码... [############] 100%',
      '获取 root 权限...',
      '下载机密文件...',
      '清除痕迹...',
      '...',
      '哈哈，骗你的，什么都没发生 😂'
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        Terminal.println(messages[i], i === messages.length - 1 ? 'warning' : 'success');
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);
  }
});
