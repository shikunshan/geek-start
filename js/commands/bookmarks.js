const BookmarkManager = {
  bookmarklets: [],

  getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Edg')) return 'edge';
    if (ua.includes('Chrome')) return 'chrome';
    return 'unknown';
  },

  openBookmarkManager() {
    const browser = this.getBrowserInfo();
    let url;

    switch (browser) {
      case 'chrome':
        url = 'chrome://bookmarks/';
        break;
      case 'edge':
        url = 'edge://favorites/';
        break;
      case 'firefox':
        url = 'chrome://browser/content/places/places.xhtml';
        break;
      default:
        url = 'about:bookmarks';
    }

    window.open(url, '_blank');
    return { browser, url };
  },

  addCurrentPage(name) {
    const bookmark = {
      name: name || document.title,
      url: window.location.href
    };
    this.bookmarklets.push(bookmark);
    return bookmark;
  },

  list() {
    if (this.bookmarklets.length === 0) {
      Terminal.println('暂无快捷书签', 'dim');
      Terminal.println('');
      Terminal.println('用法:', 'info');
      Terminal.println('  bookmarks          - 打开浏览器书签管理器', '');
      Terminal.println('  bookmarks add      - 添加当前页面到快捷书签', '');
      Terminal.println('  bookmarks list     - 显示快捷书签列表', '');
      Terminal.println('  bookmarks rm <编号> - 删除快捷书签', '');
      return;
    }

    Terminal.println('快捷书签列表:', 'info');
    Terminal.println('');

    this.bookmarklets.forEach((bm, i) => {
      const index = i + 1;
      Terminal.printHtml(
        `<div class="bookmark-item">` +
        `<span class="bookmark-index">[${index}]</span>` +
        `<span class="bookmark-name">${Utils.escapeHtml(bm.name)}</span>` +
        `</div>`
      );
    });

    Terminal.println('');
    Terminal.println('用法: bookmarks open <编号>  |  bookmarks rm <编号>', 'dim');
  },

  open(index) {
    if (index < 1 || index > this.bookmarklets.length) {
      Terminal.println(`找不到编号 ${index}`, 'error');
      return;
    }
    const bm = this.bookmarklets[index - 1];
    Terminal.println(`正在打开 ${bm.name}...`, 'info');
    window.open(bm.url, '_blank');
  },

  remove(index) {
    if (index < 1 || index > this.bookmarklets.length) {
      Terminal.println(`找不到编号 ${index}`, 'error');
      return false;
    }
    const removed = this.bookmarklets.splice(index - 1, 1);
    Terminal.println(`已删除: ${removed[0].name}`, 'success');
    return true;
  }
};

CommandRegistry.register({
  name: 'bookmarks',
  alias: ['bm'],
  description: '浏览器书签管理',
  usage: 'bookmarks [list|add|rm <编号>|open <编号>]',
  handler: async (args) => {
    if (args.length === 0 || (args.length === 1 && args[0] === 'list')) {
      BookmarkManager.list();
      return;
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === 'add') {
      const name = args.slice(1).join(' ') || document.title;
      const bookmark = BookmarkManager.addCurrentPage(name);
      Terminal.println(`已添加快捷书签: ${bookmark.name}`, 'success');
      Terminal.println(`URL: ${bookmark.url}`, 'dim');
      return;
    }

    if (subCmd === 'rm' || subCmd === 'remove' || subCmd === 'delete' || subCmd === 'del') {
      if (args.length < 2) {
        Terminal.println('用法: bookmarks rm <编号>', 'error');
        return;
      }
      const index = parseInt(args[1]);
      if (isNaN(index)) {
        Terminal.println('编号必须是数字', 'error');
        return;
      }
      BookmarkManager.remove(index);
      return;
    }

    if (subCmd === 'open') {
      if (args.length < 2) {
        const result = BookmarkManager.openBookmarkManager();
        Terminal.println(`正在打开 ${result.browser} 书签管理器...`, 'info');
        return;
      }
      const index = parseInt(args[1]);
      if (isNaN(index)) {
        Terminal.println('编号必须是数字', 'error');
        return;
      }
      BookmarkManager.open(index);
      return;
    }

    if (subCmd === 'help') {
      Terminal.println('书签命令:', 'info');
      Terminal.println('  bookmarks          - 打开浏览器书签管理器', '');
      Terminal.println('  bookmarks list     - 显示快捷书签列表', '');
      Terminal.println('  bookmarks add      - 添加当前页面到快捷书签', '');
      Terminal.println('  bookmarks add <名称> - 添加当前页面到快捷书签（自定义名称）', '');
      Terminal.println('  bookmarks open     - 打开浏览器书签管理器', '');
      Terminal.println('  bookmarks open <编号> - 打开快捷书签', '');
      Terminal.println('  bookmarks rm <编号> - 删除快捷书签', '');
      return;
    }

    Terminal.println(`未知子命令: ${subCmd}`, 'error');
    Terminal.println('用法: bookmarks [list|add|open|rm]', 'dim');
  }
});
