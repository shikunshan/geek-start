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
    const config = Storage.get("config", {});
    const username = config.username || "geek";

    return {
      username,
      browser: `${browser.name} ${browser.version}`,
      os,
      resolution,
      uptime,
      theme: config.theme || "default",
    };
  },
};

CommandRegistry.register({
  name: "neofetch",
  alias: [],
  description: "显示系统信息",
  usage: "neofetch",
  handler: async () => {
    const info = SystemInfo.getNeofetch();

    const asciiArt = '\n' + Utils.ASCII_BANNER.map(line => `   ${line}`).join('\n') + '\n';

    Terminal.println("");
    Terminal.printHtml(
      `<div class="ascii-art" style="color: var(--info-color);">${asciiArt}</div>`,
    );
    Terminal.println("");

    Terminal.printHtml(
      `<div class="neofetch-box">` +
        `<div class="neofetch-line"><span class="neofetch-label">用户:</span> ${Utils.escapeHtml(info.username)}</div>` +
        `<div class="neofetch-line"><span class="neofetch-label">浏览器:</span> ${Utils.escapeHtml(info.browser)}</div>` +
        `<div class="neofetch-line"><span class="neofetch-label">系统:</span> ${Utils.escapeHtml(info.os)}</div>` +
        `<div class="neofetch-line"><span class="neofetch-label">分辨率:</span> ${Utils.escapeHtml(info.resolution)}</div>` +
        `<div class="neofetch-line"><span class="neofetch-label">运行时间:</span> ${Utils.escapeHtml(info.uptime)}</div>` +
        `<div class="neofetch-line"><span class="neofetch-label">主题:</span> ${Utils.escapeHtml(info.theme)}</div>` +
        `</div>`,
    );
  },
});

CommandRegistry.register({
  name: "uptime",
  alias: [],
  description: "显示页面运行时间",
  usage: "uptime",
  handler: async () => {
    const uptime = SystemInfo.getUptime();
    Terminal.println(`已运行: ${uptime}`, "info");
  },
});

CommandRegistry.register({
  name: "date",
  alias: ["time"],
  description: "显示当前日期时间",
  usage: "date",
  handler: async () => {
    const now = new Date();
    Terminal.println(
      now.toLocaleString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      "info",
    );
  },
});
