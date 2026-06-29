const SystemInfo = {
  startTime: Date.now(),

  getUptime() {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    return Utils.formatTime(seconds);
  },

  getNeofetch() {
    const browser = Utils.getBrowserInfo();
    const os = Utils.getOSInfo();
    const resolution = Utils.getResolution();
    const uptime = this.getUptime();
    const config = Storage.get('config', {});
    const username = config.username || 'geek';

    return {
      username,
      browser: `${browser.name} ${browser.version}`,
      os,
      resolution,
      uptime,
      bookmarks: BookmarkManager.getAll().length,
      theme: config.theme || 'default'
    };
  }
};

CommandRegistry.register({
  name: 'neofetch',
  alias: ['neo'],
  description: '显示系统信息',
  usage: 'neofetch',
  handler: async () => {
    const info = SystemInfo.getNeofetch();

    const asciiArt = `
   ██████╗ ███████╗███████╗██╗  ██╗███████╗████████╗ █████╗ ██████╗ ████████╗
   ██╔══██╗██╔════╝██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝
   ██████╔╝█████╗  █████╗  █████╔╝ ███████╗   ██║   ███████║██████╔╝   ██║   
   ██╔══██╗██╔══╝  ██╔══╝  ██╔═██╗ ╚════██║   ██║   ██╔══██║██╔══██╗   ██║   
   ██║  ██║███████╗███████╗██║  ██╗███████║   ██║   ██║  ██║██║  ██║   ██║   
   ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
`;

    Terminal.println('');
    Terminal.printHtml(`<div class="ascii-art" style="color: var(--info-color);">${asciiArt}</div>`);
    Terminal.println('');

    Terminal.printHtml(
      `<div class="neofetch-box">` +
      `<div class="neofetch-line"><span class="neofetch-label">用户:</span> ${Utils.escapeHtml(info.username)}</div>` +
      `<div class="neofetch-line"><span class="neofetch-label">浏览器:</span> ${Utils.escapeHtml(info.browser)}</div>` +
      `<div class="neofetch-line"><span class="neofetch-label">系统:</span> ${Utils.escapeHtml(info.os)}</div>` +
      `<div class="neofetch-line"><span class="neofetch-label">分辨率:</span> ${Utils.escapeHtml(info.resolution)}</div>` +
      `<div class="neofetch-line"><span class="neofetch-label">运行时间:</span> ${Utils.escapeHtml(info.uptime)}</div>` +
      `<div class="neofetch-line"><span class="neofetch-label">书签数量:</span> ${info.bookmarks}</div>` +
      `<div class="neofetch-line"><span class="neofetch-label">主题:</span> ${Utils.escapeHtml(info.theme)}</div>` +
      `</div>`
    );
    Terminal.println('');
  }
});

CommandRegistry.register({
  name: 'uptime',
  alias: [],
  description: '显示页面运行时间',
  usage: 'uptime',
  handler: async () => {
    const uptime = SystemInfo.getUptime();
    Terminal.println(`已运行: ${uptime}`, 'info');
  }
});

CommandRegistry.register({
  name: 'whoami',
  alias: [],
  description: '显示当前用户名',
  usage: 'whoami',
  handler: async () => {
    const config = Storage.get('config', {});
    const username = config.username || 'geek';
    Terminal.println(username, 'info');
  }
});

CommandRegistry.register({
  name: 'top',
  alias: [],
  description: '模拟系统资源监控',
  usage: 'top',
  handler: async () => {
    const cpuUsage = Utils.randomInt(5, 40);
    const memUsage = Utils.randomInt(30, 70);
    const netSpeed = Utils.randomInt(100, 5000);

    Terminal.println('系统资源监控 (模拟)', 'info');
    Terminal.println('');
    Terminal.println(`CPU 使用率: ${cpuUsage}%`, '');
    Terminal.println(`内存使用率: ${memUsage}%`, '');
    Terminal.println(`网络速度: ${netSpeed} KB/s`, '');
    Terminal.println('');
    Terminal.println('(这是模拟数据，按 Ctrl+C 返回)', 'dim');
  }
});

CommandRegistry.register({
  name: 'date',
  alias: ['time'],
  description: '显示当前日期时间',
  usage: 'date',
  handler: async () => {
    const now = new Date();
    Terminal.println(now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }), 'info');
  }
});
