const SearchEngine = {
  engines: {
    google: {
      name: "Google",
      url: "https://www.google.com/search?q=",
      prefixes: ["g", "google"],
    },
    github: {
      name: "GitHub",
      url: "https://github.com/search?q=",
      prefixes: ["gh", "github"],
    },
    npm: {
      name: "npm",
      url: "https://www.npmjs.com/search?q=",
      prefixes: ["npm"],
    },
    bing: {
      name: "Bing",
      url: "https://www.bing.com/search?q=",
      prefixes: ["bing"],
    },
    baidu: {
      name: "百度",
      url: "https://www.baidu.com/s?wd=",
      prefixes: ["bd", "baidu"],
    },
  },

  getDefaultEngine() {
    const config = Storage.get("config", {});
    return config.defaultSearch || "google";
  },

  findEngine(prefix) {
    const lowerPrefix = prefix.toLowerCase();
    for (const key of Object.keys(this.engines)) {
      const engine = this.engines[key];
      if (engine.prefixes.includes(lowerPrefix)) {
        return { key, engine };
      }
    }
    return null;
  },

  search(query, engineKey = null) {
    let engine;
    let searchQuery = query;

    if (engineKey) {
      const found = this.findEngine(engineKey);
      if (found) {
        engine = found.engine;
      }
    }

    if (!engine) {
      const parts = query.split(/\s+/);
      if (parts.length > 1) {
        const first = parts[0];
        const found = this.findEngine(first);
        if (found) {
          engine = found.engine;
          searchQuery = parts.slice(1).join(" ");
        }
      }
    }

    if (!engine) {
      const defaultKey = this.getDefaultEngine();
      engine = this.engines[defaultKey] || this.engines.google;
    }

    const url = engine.url + encodeURIComponent(searchQuery);
    Terminal.println(`正在使用 ${engine.name} 搜索: ${searchQuery}`, "info");
    window.open(url, "_blank");
  },

  listEngines() {
    return Object.keys(this.engines).map((key) => ({
      key,
      name: this.engines[key].name,
      prefixes: this.engines[key].prefixes,
    }));
  },
};

CommandRegistry.register({
  name: "search",
  alias: ["s", "find"],
  description: "网页搜索",
  usage: "search [引擎] <关键词>",
  handler: async (args) => {
    if (args.length === 0) {
      const defaultKey = SearchEngine.getDefaultEngine();
      const defaultEngine = SearchEngine.engines[defaultKey];
      Terminal.println('当前状态:', 'info');
      Terminal.println(`  默认引擎: ${defaultEngine.name} (${defaultKey})`, '');
      Terminal.println('');
      Terminal.printList(
        '可用引擎:',
        SearchEngine.listEngines().map((e) => `${e.key} (${e.prefixes.join(', ')}): ${e.name}`)
      );
      Terminal.println('');
      Terminal.println('用法: search <关键词>  |  search <引擎> <关键词>', 'dim');
      return;
    }

    const query = args.join(" ");
    SearchEngine.search(query);
  },
});
