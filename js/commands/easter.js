const EasterEggs = {
  fortunes: [
    "代码写得好，bug 自然少",
    "今天适合重构代码",
    "记得写单元测试",
    "咖啡是程序员的血液",
    "Stack Overflow 是最好的老师",
    "不要在深夜部署生产环境",
    "先让代码跑起来，再优化",
    "命名是最难的问题",
    "注释要写，但不要太多",
    "保持代码简洁",
    "每一行代码都是给未来自己的信",
    "善用搜索引擎",
    "休息一下，再回来调试",
    "好的代码是最好的文档",
    "版本控制救过很多人命",
  ],
};

CommandRegistry.register({
  name: "fortune",
  alias: [],
  description: "随机显示一句格言",
  usage: "fortune",
  handler: async () => {
    const fortune = Utils.randomFromArray(EasterEggs.fortunes);
    Terminal.println(fortune, "success");
  },
});

CommandRegistry.register({
  name: "hack",
  alias: [],
  description: "模拟黑客入侵",
  usage: "hack",
  handler: async () => {
    const messages = [
      "正在建立连接...",
      "绕过防火墙...",
      "破解密码... [#######     ] 50%",
      "破解密码... [##########  ] 80%",
      "破解密码... [############] 100%",
      "获取 root 权限...",
      "下载机密文件...",
      "清除痕迹...",
      "...",
      "哈哈，骗你的，什么都没发生 😂",
    ];

    let i = 0;
    let offInterrupt = null;
    const stop = () => {
      clearInterval(interval);
      if (offInterrupt) offInterrupt();
    };
    const interval = setInterval(() => {
      if (i < messages.length) {
        Terminal.println(
          messages[i],
          i === messages.length - 1 ? "warning" : "success",
        );
        i++;
      } else {
        stop();
      }
    }, 400);
    // Ctrl+C stops the animation
    offInterrupt = Terminal.onInterrupt(stop);
  },
});
