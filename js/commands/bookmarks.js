const BookmarkManager = {
  defaultBookmarks: [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Gmail', url: 'https://mail.google.com' },
    { name: 'YouTube', url: 'https://www.youtube.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { name: 'MDN', url: 'https://developer.mozilla.org' },
    { name: 'npm', url: 'https://www.npmjs.com' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com' },
    { name: 'Reddit', url: 'https://www.reddit.com' }
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
    return bookmarks.find(b => b.name.toLowerCase() === lowerName);
  }
};

CommandRegistry.register({
  name: 'bookmarks',
  alias: ['bm', 'bookmark'],
  description: '管理书签',
  usage: 'bookmarks [add <name> <url> | rm <index> | list]',
  handler: async (args) => {
    if (args.length === 0 || args[0] === 'list' || args[0] === 'ls') {
      this.listBookmarks();
      return;
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === 'add') {
      if (args.length < 3) {
        Terminal.println('用法: bookmarks add <名称> <URL>', 'error');
        return;
      }
      const name = args[1];
      let url = args[2];
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const index = BookmarkManager.add(name, url);
      Terminal.println(`已添加书签 [${index}]: ${name} - ${url}`, 'success');
      return;
    }

    if (subCmd === 'rm' || subCmd === 'remove' || subCmd === 'del') {
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

    Terminal.println(`未知子命令: ${subCmd}`, 'error');
  },

  listBookmarks() {
    const bookmarks = BookmarkManager.getAll();
    if (bookmarks.length === 0) {
      Terminal.println('暂无书签', 'dim');
      return;
    }

    Terminal.println(`书签列表 (共 ${bookmarks.length} 个):`, 'info');
    Terminal.println('');

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
    Terminal.println('使用 open <编号> 打开书签', 'dim');
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

    const arg = args[0];
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
