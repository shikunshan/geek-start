const BackgroundManager = {
  images: {
    mountain: 'assets/images/mountain.webp',
    sea: 'assets/images/sea.webp',
    'snow-mountain': 'assets/images/snow-mountain.webp',
    snow: 'assets/images/snow.webp',
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
    return this.applyImage(name);
  },

  applyImage(name) {
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

    // Preload before swapping to avoid visible pop-in on multi-MB images
    const img = new Image();
    img.onload = () => {
      this.overlayEl.style.backgroundImage = `url('${imagePath}')`;
      this.overlayEl.classList.add('active');
    };
    img.src = imagePath;
    this.currentImage = name;
    return true;
  },

  setRandom() {
    const names = Object.keys(this.images);
    // Avoid picking the same image twice in a row
    const candidates = names.filter(n => n !== this.currentImage);
    const randomName = Utils.randomFromArray(candidates.length ? candidates : names);
    // applyImage (not setImage) so the rotation interval isn't cancelled by its own tick
    this.applyImage(randomName);
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
      Terminal.printList('可用背景:', BackgroundManager.listImages());
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
      Terminal.printList('可用背景:', BackgroundManager.listImages());
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
