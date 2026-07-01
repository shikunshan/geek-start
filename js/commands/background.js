const BackgroundManager = {
  images: {
    mountain: 'assets/images/mountain.jpg',
    sea: 'assets/images/sea.jpg',
    'snow-mountain': 'assets/images/snow-mountain.jpg',
    snow: 'assets/images/snow.jpg',
    'starry-night': 'assets/images/starry-night.jpg'
  },

  currentImage: null,
  intervalId: null,
  overlayEl: null,

  init() {
    this.overlayEl = document.getElementById('background-overlay');
  },

  setImage(name) {
    this.stopRandom();

    if (name === 'none' || !name) {
      this.overlayEl.classList.remove('active');
      this.overlayEl.style.backgroundImage = '';
      this.currentImage = null;
      return true;
    }

    const imagePath = this.images[name];
    if (!imagePath) {
      return false;
    }

    this.overlayEl.style.backgroundImage = `url('${imagePath}')`;
    this.overlayEl.classList.add('active');
    this.currentImage = name;
    return true;
  },

  setRandom() {
    const names = Object.keys(this.images);
    const randomName = Utils.randomFromArray(names);
    this.setImage(randomName);
    return randomName;
  },

  startRandom(interval = 30000) {
    this.stopRandom();
    this.setRandom();
    this.intervalId = setInterval(() => {
      this.setRandom();
    }, interval);
  },

  stopRandom() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },

  isRandomRunning() {
    return this.intervalId !== null;
  },

  listImages() {
    return Object.keys(this.images);
  }
};

CommandRegistry.register({
  name: 'background',
  alias: ['bg'],
  description: '切换背景图片',
  usage: 'background [名称]',
  handler: async (args) => {
    if (args.length === 0) {
      const current = BackgroundManager.currentImage || 'none';
      Terminal.println('当前状态:', 'info');
      Terminal.println(`  当前背景: ${current}`, '');
      Terminal.println('');
      Terminal.println('可用背景:', 'info');
      BackgroundManager.listImages().forEach(name => {
        Terminal.println(`  ${name}`, '');
      });
      Terminal.println('');
      Terminal.println('  none    - 纯黑背景', '');
      Terminal.println('  random  - 随机轮播', '');
      Terminal.println('');
      Terminal.println('用法: background <名称>', 'dim');
      return;
    }

    const arg = args[0].toLowerCase();

    if (arg === 'random') {
      BackgroundManager.startRandom(30000);
      Terminal.println('已开启随机背景轮播', 'success');
      return;
    }

    if (arg === 'none' || arg === 'black' || arg === 'off') {
      BackgroundManager.setImage('none');
      Terminal.println('已关闭背景', 'success');
      return;
    }

    if (arg === 'list' || arg === 'ls') {
      Terminal.println('可用背景:', 'info');
      BackgroundManager.listImages().forEach(name => {
        Terminal.println(`  ${name}`, '');
      });
      return;
    }

    const success = BackgroundManager.setImage(arg);
    if (success) {
      Terminal.println(`已切换背景: ${arg}`, 'success');
    } else {
      Terminal.println(`找不到背景: ${arg}`, 'error');
      Terminal.println(`可用: ${BackgroundManager.listImages().join(', ')}`, 'dim');
    }
  }
});
