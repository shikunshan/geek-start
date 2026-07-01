CommandRegistry.register({
  name: 'css',
  alias: ['cssart', 'animation'],
  description: 'CSS 动画艺术',
  usage: 'css [christmas|starnight]',
  handler: async (args) => {
    if (args.length === 0 || args[0] === 'christmas') {
      this.showChristmasTree();
      return;
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === 'starnight' || subCmd === 'starry' || subCmd === 'night') {
      this.showStarryNight();
      return;
    }

    Terminal.println('可用动画:', 'info');
    Terminal.println('  christmas  - 圣诞树动画', '');
    Terminal.println('  starnight  - 星夜动画', '');
    Terminal.println('');
    Terminal.println('用法: css christmas', 'dim');
  },

  showChristmasTree() {
    Terminal.println('');
    const tree = `
           ★
          /|\\
         /_|__\\
          /|\\
         / | \\
        /__|__\\
          /|\\
         / | \\
        /  |  \\
       /___|___\\
          /|\\
         / | \\
        /  |  \\
       /   |   \\
      /____|____\\
          |||
          |||
     ════════════════
    `.trim();

    const pre = document.createElement('pre');
    pre.className = 'ascii-art';
    pre.style.cssText = `
      color: #228B22;
      text-align: center;
      font-size: 14px;
      line-height: 1.2;
      animation: treeGlow 2s ease-in-out infinite;
    `;
    pre.textContent = tree;

    const style = document.createElement('style');
    style.id = 'christmas-style';
    style.textContent = `
      @keyframes treeGlow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3) hue-rotate(20deg); }
      }
    `;
    document.head.appendChild(style);
    Terminal.printHtml(pre);

    Terminal.println('');
    Terminal.println('🎄 圣诞树动画已显示！', 'success');
    Terminal.println('');
  },

  showStarryNight() {
    Terminal.println('');

    const container = document.createElement('div');
    container.style.cssText = `
      width: 100%;
      height: 300px;
      background: linear-gradient(to bottom, #0a0a2e 0%, #1a1a4e 50%, #2d1b4e 100%);
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      margin: 10px 0;
    `;

    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: white;
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 60}%;
        animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      container.appendChild(star);
    }

    const moon = document.createElement('div');
    moon.style.cssText = `
      position: absolute;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle at 30% 30%, #fffacd, #ffd700);
      border-radius: 50%;
      right: 15%;
      top: 15%;
      box-shadow: 0 0 30px #ffd700, 0 0 60px #ffd70055;
    `;
    container.appendChild(moon);

    const style = document.createElement('style');
    style.id = 'starnight-style';
    style.textContent = `
      @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.5); }
      }
    `;
    document.head.appendChild(style);

    Terminal.printHtml(container);
    Terminal.println('');
    Terminal.println('🌌 星夜动画已显示！', 'success');
    Terminal.println('');
  }
});
