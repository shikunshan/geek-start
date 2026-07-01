const BookmarkManager = {
  defaultBookmarks: [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Gmail', url: 'https://mail.google.com' },
    { name: 'YouTube', url: 'https://www.youtube.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { name: 'npm', url: 'https://www.npmjs.com' },
    { name: '百度', url: 'https://www.baidu.com' },
    { name: '掘金', url: 'https://juejin.cn' },
    { name: '知乎', url: 'https://www.zhihu.com' }
  ],

  getAll() {
    return Storage.get('bookmarks', [...this.defaultBookmarks]);
  },

  save(bookmarks) {
    Storage.set('bookmarks', bookmarks);
  },

  add(name, url) {
    const bookmarks = this.getAll();
    bookmarks.push({ name, url });
    this.save(bookmarks);
    return bookmarks.length;
  },

  remove(index) {
    const bookmarks = this.getAll();
    if (index < 1 || index > bookmarks.length) {
      return false;
    }
    bookmarks.splice(index - 1, 1);
    this.save(bookmarks);
    return true;
  },

  get(index) {
    const bookmarks = this.getAll();
    if (index < 1 || index > bookmarks.length) {
      return null;
    }
    return bookmarks[index - 1];
  },

  findByName(name) {
    const bookmarks = this.getAll();
    const lowerName = name.toLowerCase();
    return bookmarks.find(b => b.name.toLowerCase().includes(lowerName));
  },

  reset() {
    this.save([...this.defaultBookmarks]);
  }
};

CommandRegistry.register({
  name: 'bookmarks',
  alias: ['bm'],
  description: '管理书签',
  usage: 'bookmarks [add <名称> <URL> | rm <编号>]',
  handler: async (args) => {
    if (args.length === 0) {
      this.listBookmarks();
      return;
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === 'add') {
      if (args.length < 3) {
        Terminal.println('用法: bookmarks add <名称> <URL>', 'error');
        return;
      }
      const name = args.slice(1, -1).join(' ');
      let url = args[args.length - 1];
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const index = BookmarkManager.add(name, url);
      Terminal.println(`已添加书签 [${index}]: ${name}`, 'success');
      return;
    }

    if (subCmd === 'rm') {
      if (args.length < 2) {
        Terminal.println('用法: bookmarks rm <编号>', 'error');
        return;
      }
      const index = parseInt(args[1]);
      if (isNaN(index)) {
        Terminal.println('编号必须是数字', 'error');
        return;
      }
      const success = BookmarkManager.remove(index);
      if (success) {
        Terminal.println(`已删除书签 [${index}]`, 'success');
      } else {
        Terminal.println(`找不到编号为 ${index} 的书签`, 'error');
      }
      return;
    }

    if (subCmd === 'reset') {
      BookmarkManager.reset();
      Terminal.println('已重置为默认书签', 'success');
      return;
    }

    Terminal.println(`未知子命令: ${subCmd}`, 'error');
  },

  listBookmarks() {
    const bookmarks = BookmarkManager.getAll();
    Terminal.println('书签列表:', 'info');
    Terminal.println('');

    if (bookmarks.length === 0) {
      Terminal.println('暂无书签，使用 bookmarks add <名称> <URL> 添加', 'dim');
      return;
    }

    bookmarks.forEach((bm, i) => {
      const index = Utils.padLeft(i + 1, 2, ' ');
      Terminal.printHtml(
        `<div class="bookmark-item">` +
        `<span class="bookmark-index">[${index}]</span>` +
        `<span class="bookmark-name">${Utils.escapeHtml(bm.name)}</span>` +
        `<span class="bookmark-url">${Utils.escapeHtml(bm.url)}</span>` +
        `</div>`
      );
    });

    Terminal.println('');
    Terminal.println('用法: open <编号|名称>  |  bookmarks add <名称> <URL>  |  bookmarks rm <编号>', 'dim');
  }
});

CommandRegistry.register({
  name: 'open',
  alias: ['o'],
  description: '打开书签',
  usage: 'open <编号|名称>',
  handler: async (args) => {
    if (args.length === 0) {
      Terminal.println('用法: open <编号|名称>', 'error');
      return;
    }

    const arg = args.join(' ');
    let bookmark = null;

    const index = parseInt(arg);
    if (!isNaN(index)) {
      bookmark = BookmarkManager.get(index);
    }

    if (!bookmark) {
      bookmark = BookmarkManager.findByName(arg);
    }

    if (!bookmark) {
      Terminal.println(`找不到书签: ${arg}`, 'error');
      return;
    }

    Terminal.println(`正在打开 ${bookmark.name}...`, 'info');
    window.open(bookmark.url, '_blank');
  }
});
