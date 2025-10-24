# 项目概览

## 🎯 项目名称
**Hover-Fill Sidebar** - Chrome 浏览器扩展

## 📋 项目描述
一个 Chrome 浏览器扩展，在浏览器窗口的最右侧边缘生成一个 2px 宽的触碰区域。当鼠标悬停在此区域时，会滑出一个侧边栏面板，显示预设的文本值。当鼠标悬停在任意一行上超过 1 秒钟时，该行的值将自动填充到当前网页上处于活动状态的输入框中。

## ✨ 核心功能
- 🎯 **快速调出**：鼠标甩到最右侧即可调出侧边栏
- ⏱️ **悬停填充**：悬停 1 秒自动填充，无需点击
- 🔒 **样式隔离**：使用 Shadow DOM 确保扩展 UI 不受网页 CSS 影响
- 📝 **易于管理**：在选项页面轻松添加、编辑、删除预设值
- 🌐 **兼容性强**：支持 React、Vue 等现代框架的表单
- 💾 **本地存储**：所有数据保存在本地，无需云同步

## 🛠️ 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 清单版本 | Manifest V3 | 3 |
| 核心语言 | TypeScript | 5.1.6 |
| 选项页面 | Vue 3 | 3.3.4 |
| 构建工具 | Vite | 4.4.9 |
| UI 隔离 | Shadow DOM | 原生 |
| 数据存储 | chrome.storage.local | 原生 API |
| 运行环境 | Node.js | 21.1.0 |

## 📁 项目结构

```
sideFill/
├── src/                          # 源代码目录
│   ├── manifest.json             # Chrome 扩展清单 (MV3)
│   ├── options.html              # 选项页面 HTML
│   ├── options.ts                # Vue 应用入口
│   ├── OptionsApp.vue            # Vue 3 选项页面组件
│   ├── content.ts                # Content Script (核心功能)
│   ├── content.css               # Content Script 样式
│   └── vue.d.ts                  # Vue 类型定义
│
├── dist/                         # 构建输出目录（加载到 Chrome 时使用）
│   ├── manifest.json
│   ├── options.html
│   ├── options.js
│   ├── options.css
│   ├── content.js
│   └── content.css
│
├── package.json                  # 项目依赖配置
├── vite.config.ts                # Vite 构建配置
├── tsconfig.json                 # TypeScript 配置
├── tsconfig.node.json            # Node TypeScript 配置
├── .gitignore                    # Git 忽略文件
│
├── README.md                     # 详细使用文档
├── QUICKSTART.md                 # 快速开始指南
├── TESTING.md                    # 测试指南
├── DEVELOPMENT_SUMMARY.md        # 开发总结
├── CHECKLIST.md                  # 完成清单
└── PROJECT_OVERVIEW.md           # 本文件
```

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 构建项目
```bash
npm run build
```

### 3. 加载到 Chrome
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 文件夹

### 4. 配置预设值
1. 点击扩展的"选项"
2. 添加预设值（标签 + 值）
3. 点击"添加"

### 5. 使用扩展
1. 打开任何网页
2. 将鼠标移动到浏览器**最右侧边缘**
3. 侧边栏会滑出
4. 悬停在预设值上 1 秒，自动填充

## 📚 文档

| 文档 | 说明 |
|------|------|
| `README.md` | 详细的功能说明、安装方法和使用指南 |
| `QUICKSTART.md` | 5 分钟快速上手指南 |
| `TESTING.md` | 详细的测试步骤和故障排除 |
| `DEVELOPMENT_SUMMARY.md` | 技术细节和实现说明 |
| `CHECKLIST.md` | 项目完成清单 |
| `PROJECT_OVERVIEW.md` | 本文件 |

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# TypeScript 类型检查
npx tsc --noEmit
```

## 📦 构建输出

构建完成后，`dist` 目录包含以下文件：

```
dist/
├── manifest.json          # 扩展清单
├── options.html           # 选项页面
├── options.js             # Vue 应用编译后的 JS
├── options.css            # 选项页面样式
├── content.js             # Content Script 编译后的 JS
└── content.css            # Content Script 样式
```

## 🎨 架构设计

### 三层架构

```
┌─────────────────────────────────────────┐
│         Options Page (Vue 3)            │
│  - 添加/编辑/删除预设值                  │
│  - 与 chrome.storage.local 交互         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      chrome.storage.local               │
│  - 存储预设值                            │
│  - 跨标签页共享数据                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    Content Script (原生 JS)             │
│  - 注入 Shadow DOM UI                   │
│  - 跟踪活动输入框                        │
│  - 实现自动填充逻辑                      │
└─────────────────────────────────────────┘
```

### 数据流

```
用户在选项页添加预设值
        ↓
保存到 chrome.storage.local
        ↓
Content Script 读取数据
        ↓
在侧边栏中显示预设值
        ↓
用户悬停 1 秒
        ↓
自动填充到活动输入框
```

## 🧪 测试覆盖

已实现的测试场景：
- ✅ 配置预设值（添加、编辑、删除）
- ✅ 侧边栏显示和隐藏
- ✅ 自动填充功能
- ✅ 快速划过不触发填充
- ✅ 多框架兼容性（React、Vue）
- ✅ 样式隔离
- ✅ 多页面测试
- ✅ 数据持久化
- ✅ 性能测试

详见 `TESTING.md`

## 🔐 权限说明

扩展请求的权限：
- `storage` - 允许读写 `chrome.storage.local`
- `<all_urls>` - 允许在所有网页上运行 Content Script

## 🌟 关键特性

### 1. Shadow DOM 隔离
- 所有 UI 元素都在 Shadow DOM 内
- CSS 完全隔离，不受网页影响
- 确保扩展 UI 在任何网站上都能正常显示

### 2. 智能填充
- 自动检测当前活动的输入框
- 派发 `input` 和 `change` 事件
- 兼容 React、Vue 等现代框架

### 3. 用户友好
- 直观的选项页面
- 实时反馈（成功/错误消息）
- 简单的编辑和删除操作

### 4. 高性能
- 轻量级 Content Script
- 高效的事件处理
- 最小化 DOM 操作

## 📝 代码质量

- ✅ TypeScript 类型检查通过
- ✅ 没有编译错误
- ✅ 代码结构清晰
- ✅ 注释完整
- ✅ 遵循最佳实践

## 🚢 部署

### 开发部署
1. 运行 `npm run build`
2. 在 `chrome://extensions/` 中加载 `dist` 文件夹

### 生产部署
1. 运行 `npm run build`
2. 将 `dist` 文件夹打包为 ZIP
3. 上传到 Chrome Web Store

## 🔄 更新流程

1. 修改源代码
2. 运行 `npm run build`
3. 在 Chrome 中重新加载扩展（F5 或点击重新加载按钮）

## 📞 支持

- 查看 `README.md` 了解详细功能
- 查看 `QUICKSTART.md` 快速上手
- 查看 `TESTING.md` 了解测试和故障排除
- 查看 `DEVELOPMENT_SUMMARY.md` 了解技术细节

## 📄 许可证

MIT

## 🎓 学习资源

- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 指南](https://developer.chrome.com/docs/extensions/mv3/)
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Shadow DOM 文档](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)

## ✅ 项目状态

**开发完成** ✅

所有功能已实现，所有文件已生成，项目已准备好进行测试和部署。

---

**最后更新**：2025-10-24
**项目版本**：1.0.0
**Node.js 版本**：21.1.0

