# GeekStart - 极客终端导航页

一个外观与交互完全模仿 Linux 终端的浏览器导航起始页，通过输入命令完成搜索、背景切换、音乐播放等操作，主打极客美学与高效率。

## ✨ 功能特性

### 核心功能
- **终端体验**：经典终端风格界面，闪烁光标，打字回显
- **命令历史**：↑↓ 键浏览历史命令，支持 Tab 自动补全
- **多主题**：内置 default / nord / dracula / gruvbox / monokai 五种配色主题
- **背景系统**：支持多种背景图片切换，随机轮播模式
- **多引擎搜索**：Google / GitHub / npm / Bing / 百度
- **音乐播放**：内置音乐播放器
- **系统信息**：neofetch / uptime 等命令
- **AI 对话**：内置 AI 助手，支持流式输出

### 彩蛋命令
- `fortune` - 随机格言
- `hack` - 模拟黑客入侵

## 🚀 快速开始

### Node.js 后端（支持 AI 代理）

```bash
# 安装依赖
npm install

# 复制配置文件
cp .env.example .env
# 编辑 .env，填入你的 LLM_API_KEY

# 启动服务
npm start
```

然后访问 `http://localhost:3000`

## 🤖 AI 对话功能

### 快速开始

```bash
# 进入 AI 对话模式
ai

# 或者直接提问
ai 你好，请介绍一下自己

# 查看状态
ai status
```

### 对话模式命令

进入对话模式后，可以使用以下斜杠命令：

| 命令 | 描述 |
|------|------|
| `/exit`, `/quit` | 退出对话模式 |
| `/clear` | 清空对话上下文 |
| `Ctrl+C` | 中断 AI 生成 |

### 运行模式

#### 后端代理模式

- API Key 存在服务端，安全
- 需要启动 Node.js 后端
- 在 `.env` 中配置 `LLM_API_KEY`

### 支持的大模型

所有兼容 OpenAI API 格式的大模型都可以使用：

- OpenAI (GPT-3.5, GPT-4)
- 智谱 AI (GLM 系列)
- 通义千问
- DeepSeek
- Kimi (月之暗面)
- 百川智能
- 本地模型（Ollama, LM Studio 等）

只需设置对应的 `base_url` 和 `model` 即可。

## 📖 命令列表

| 命令 | 别名 | 描述 |
|------|------|------|
| `help` | `h`, `?` | 显示帮助信息 |
| `clear` | `cls` | 清屏 |
| `history` | - | 显示命令历史 |
| `theme` | `t` | 切换主题 |
| `background` | `bg` | 切换背景 |
| `search` | `s`, `find` | 网页搜索 |
| `music` | `m` | 音乐播放器 |
| `neofetch` | - | 显示系统信息 |
| `uptime` | - | 运行时间 |
| `date` | `time` | 当前时间 |
| `ai` | - | AI 对话助手 |
| `fortune` | - | 随机格言 |
| `hack` | - | 模拟入侵（按 Ctrl+C 停止） |

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `↑` / `↓` | 浏览历史命令 |
| `Tab` | 自动补全命令 |
| `Ctrl + L` | 清屏 |
| `Ctrl + C` | 取消当前输入 / 停止动画 / 中断 AI 生成 |

## 🎨 主题预览

- **default** - 经典黑底绿字
- **nord** - 北欧冷淡风
- **dracula** - 吸血鬼主题
- **gruvbox** - 复古暖色调
- **monokai** - 经典代码主题

## 📁 项目结构

```
geek-start/
├── index.html              # 入口页面
├── server.js               # Express 静态服务 + AI 流式代理
├── css/
│   ├── terminal.css        # 终端基础样式
│   └── themes.css          # 主题样式
├── js/
│   ├── terminal.js         # 终端核心
│   ├── command.js          # 命令注册与分发
│   ├── storage.js          # localStorage 封装
│   ├── utils.js            # 工具函数
│   └── commands/           # 各命令模块
├── assets/
│   ├── images/             # 背景图片
│   └── audio/              # 音乐文件
└── config/
    └── default.json        # 默认配置
```

## 🔒 安全说明

- `.env` 已加入 `.gitignore`，切勿将真实 API Key 提交到 git
- `/api/chat` 默认限流：每 IP 每分钟 20 次（可通过 `CHAT_RATE_LIMIT` 调整）
- 跨域默认关闭，如需开放请设置 `ALLOWED_ORIGINS`

## 🔧 技术栈

- HTML5
- CSS3 (CSS Variables)
- JavaScript (ES6+)
- localStorage 数据持久化
- 无需构建工具，原生即可运行

## 📝 许可证

MIT License
