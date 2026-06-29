# 🖥️ GeekStart — 极客终端导航页 技术开发文档（AI Agent 版）

> **一句话定位**：一个外观 & 交互完全模仿 Linux 终端的浏览器导航起始页，用户输入命令完成「搜索、书签、背景切换、音乐/白噪音、系统状态查看」等操作，主打极客美学与高效率。

---

## 一、项目目标与核心体验

### 1.1 项目目标
- 打造一个**全黑、命令行风格**的浏览器主页（New Tab / 域名首页）
- 通过「输入命令 → 实时响应」的方式完成所有操作
- 提供高度可定制、离线可用、零后端的纯前端方案

### 1.2 核心体验
- 打开页面即进入「Terminal」界面
- 闪烁光标、打字回显、命令历史
- 支持 Tab 补全、↑↓ 键切换历史命令
- 响应结果可以是文字、图片、动画、音乐、页面跳转

---

## 二、技术栈与运行环境

### 2.1 技术栈
| 层级 | 技术 |
|---|---|
| 结构 | HTML5 |
| 样式 | CSS3（优先使用 CSS Variables 做主题） |
| 逻辑 | JavaScript（ES6+） |
| 构建 | 无需构建工具（原生即可运行） |
| 数据持久化 | localStorage |
| 部署 | GitHub Pages / Cloudflare Pages / Vercel |

### 2.2 运行环境
- 现代浏览器（Chrome / Firefox / Edge / Safari）
- 仅桌面端

---

## 三、项目目录结构

```
geekstart/
├── index.html              # 入口页面
├── css/
│   ├── terminal.css        # 终端基础样式
│   └── themes.css          # 主题样式（nord / dracula / gruvbox 等）
├── js/
│   ├── terminal.js         # 终端核心（输入、光标、历史）
│   ├── command.js          # 命令注册与分发系统
│   ├── commands/
│   │   ├── help.js
│   │   ├── background.js
│   │   ├── bookmarks.js
│   │   ├── search.js
│   │   ├── music.js
│   │   ├── system.js
│   │   ├── theme.js
│   │   ├── config.js
│   │   └── easter.js
│   ├── storage.js          # localStorage 封装
│   └── utils.js            # 工具函数
├── assets/
│   ├── images/             # 背景图片（flower / sea 等）
│   ├── audio/              # 背景音乐 / 白噪音
│   └── ascii/              # ASCII Art 文件
├── config/
│   └── default.json        # 默认配置文件
└── README.md
```

---

## 四、核心模块设计

### 4.1 终端核心（terminal.js）

**职责**：
- 模拟终端输入区域
- 管理光标闪烁
- 维护命令历史（↑↓ 键）
- 渲染输出结果

**核心逻辑**：
- 页面上只有一个可编辑的输入行
- 用户输入完成后按 Enter → 触发命令解析
- 输出区域为只读，新内容追加到上方

**关键功能点**：
- `>` 提示符
- 光标闪烁动画
- 输入禁用状态（命令执行中）
- 自动滚动到底部

---

### 4.2 命令系统（command.js）

**设计模式**：命令注册表（Registry）

```javascript
// 命令结构
{
  name: 'background-image',
  alias: ['bg'],
  description: '切换背景图片',
  usage: 'background-image [random|flower|sea]',
  handler: async (args) => { ... }
}
```

**命令解析流程**：
1. 读取用户输入
2. 拆分命令名 + 参数
3. 匹配注册表中的命令
4. 执行 handler
5. 输出结果到终端

**内置命令**：
- `help` — 显示所有命令列表
- `clear` — 清屏
- `history` — 显示命令历史

---

### 4.3 背景管理（background.js）

**功能**：
- 切换全屏背景图片
- 支持随机 / 分类 / 用户自定义
- 支持自动轮播（random 模式）

**实现方式**：
- 使用 CSS `background-image` 覆盖全屏
- 图片资源存放于 `assets/images/`
- random 模式使用 `setInterval` 定时切换

**命令示例**：
```bash
background-image random    # 随机壁纸轮播
background-image flower    # 鲜花
background-image sea       # 大海
background-image none      # 纯黑
```

---

### 4.4 书签系统（bookmarks.js）

**功能**：
- 显示、添加、删除书签
- 通过编号或名称快速跳转

**数据存储**（localStorage）：
```json
{
  "bookmarks": [
    { "name": "GitHub", "url": "https://github.com" },
    { "name": "Gmail", "url": "https://mail.google.com" }
  ]
}
```

**命令示例**：
```bash
bookmarks              # 列出所有书签（带编号）
open 1                 # 打开第 1 个书签
bm add GitHub https://github.com
bm rm 1
```

---

### 4.5 搜索功能（search.js）

**功能**：
- 默认搜索引擎搜索
- 支持指定搜索引擎前缀

**命令示例**：
```bash
search react hooks
search gh fastapi      # GitHub 搜索
search npm lodash      # npm 搜索
```

**搜索引擎映射**：
| 前缀 | 搜索引擎 |
|---|---|
| （无） | Google |
| gh | GitHub |
| npm | npm |
| ddg | DuckDuckGo |
| arxiv | arXiv |

---

### 4.6 音乐 / 白噪音（music.js）

**功能**：
- 播放 / 暂停背景音乐或白噪音
- 多个预设音效可选

**命令示例**：
```bash
music play lofi
music pause
music next
rain                   # 雨声白噪音
waves                  # 海浪
cafe                   # 咖啡馆
```

**实现方式**：
- Audio API 播放 `assets/audio/` 下的音频
- 循环播放、淡入淡出

---

### 4.7 系统状态（system.js）

**命令**：
```bash
neofetch    # 显示设备/浏览器信息
uptime      # 页面运行时长
whoami      # 用户名/设备名
top         # 模拟系统资源监控
```

**neofetch 输出示例**：
```
┌───────────────────────┐
│  Browser: Chrome 120 │
│  OS: macOS 14        │
│  Resolution: 1920x  │
│  Uptime: 2h 34m     │
└───────────────────────┘
```

---

### 4.8 主题系统（theme.js）

**内置主题**：
- `default` — 经典黑底绿字
- `nord`
- `dracula`
- `gruvbox`
- `monokai`

**命令**：
```bash
theme dracula
theme list
```

**实现方式**：
- CSS Variables 定义颜色体系
- 切换主题即切换 `<body>` 上的 class

---

### 4.9 配置系统（config.js）

**命令**：
```bash
config                   # 显示当前配置
config set defaultSearch google
config set username MyName
config reset
```

**配置文件 default.json**：
```json
{
  "username": "geek",
  "defaultSearch": "google",
  "theme": "default",
  "backgroundInterval": 30000,
  "soundEnabled": false
}
```

---

### 4.10 彩蛋命令（easter.js）

| 命令 | 效果 |
|---|---|
| `sudo rm -rf /` | 显示警告：「Permission denied」 |
| `fortune` | 随机显示一句格言 |
| `sl` | 小火车 ASCII 动画 |
| `yes` | 无限输出 yes |
| `starwars` | ASCII Star Wars 动画 |
| `cowsay hello` | 牛说 hello |

---

## 五、交互设计规范

### 5.1 输入规则
- 所有输入在 `>` 提示符后完成
- 不支持鼠标点击输出区域
- Tab 键自动补全命令名
- 输入错误命令时显示：`command not found: xxx`

### 5.2 输出规则
- 命令输出紧跟输入行下方
- 错误信息使用红色文字
- 成功信息使用绿色文字
- 信息类使用白色/灰色

### 5.3 快捷键
| 快捷键 | 功能 |
|---|---|
| ↑ / ↓ | 浏览历史命令 |
| Tab | 自动补全 |
| Ctrl + L | 清屏 |
| Ctrl + C | 取消当前执行 |

---

## 六、数据持久化设计

### 6.1 存储项（localStorage）

| Key | 内容 |
|---|---|
| `geekstart_bookmarks` | 书签列表 |
| `geekstart_config` | 用户配置 |
| `geekstart_history` | 命令历史（最近 100 条） |
| `geekstart_theme` | 当前主题 |

### 6.2 初始化逻辑
- 页面加载时读取 localStorage
- 如果不存在则使用 `default.json` 的默认值
- 用户修改后实时保存

---

## 七、部署方案

### 7.1 GitHub Pages
1. 仓库名：`geekstart`
2. 推送代码到 `main` 分支
3. 开启 GitHub Pages
4. 访问 `https://<username>.github.io/geekstart/`

---

## 八、开发优先级建议

### Phase 1 — MVP（最小可用）
1. 终端核心（输入、输出、历史）
2. help / clear / history
3. background-image（random / flower / sea）
4. bookmarks（显示 + 打开）
5. search（默认 Google）

### Phase 2 — 增强体验
6. Tab 补全 / ↑↓ 历史
7. 主题系统
8. 配置系统
9. 音乐 / 白噪音

### Phase 3 — 极客化
10. neofetch / uptime / whoami
11. 彩蛋命令
12. ASCII Art / Matrix 背景
13. PWA 支持

---

## 九、关键实现提示

- 终端输出区域使用 `<div id="terminal-output">`，每行是一个 `<div class="line">`
- 输入行使用 `<input>` 或 `contenteditable`，聚焦始终在输入行
- 命令注册使用数组 + 查找匹配，便于扩展
- 所有命令 handler 返回字符串或 DOM 元素
- 背景切换修改 `document.body.style.backgroundImage`
- 音频使用 `new Audio()` 实例管理
- 主题切换修改 `document.documentElement.className`

---