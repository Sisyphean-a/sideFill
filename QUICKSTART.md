# 快速开始指南

## 5 分钟快速上手

### 第 1 步：构建项目（1 分钟）

```bash
npm install
npm run build
```

### 第 2 步：加载到 Chrome（2 分钟）

1. 打开 Chrome 浏览器
2. 在地址栏输入：`chrome://extensions/`
3. 右上角启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目目录下的 `dist` 文件夹
6. 点击"选择文件夹"

### 第 3 步：配置预设值（1 分钟）

1. 在 Chrome 扩展菜单中找到"Hover-Fill Sidebar"
2. 点击"选项"
3. 添加一个预设值：
   - 标签：`我的邮箱`
   - 值：`test@example.com`
   - 点击"添加"

### 第 4 步：测试功能（1 分钟）

1. 打开任何网页（例如 `example.com`）
2. 点击一个文本输入框
3. 将鼠标移动到浏览器**最右侧边缘**
4. 侧边栏会滑出
5. 将鼠标悬停在预设值上，**保持 1 秒**
6. 值会自动填充到输入框中

## 常见问题

### Q: 侧边栏在哪里？
A: 将鼠标移动到浏览器窗口的**最右侧边缘**（2px 宽的区域）。

### Q: 为什么没有填充？
A: 确保：
1. 输入框已获得焦点（有光标）
2. 预设值已在选项页面中添加
3. 悬停时间超过 1 秒

### Q: 如何修改预设值？
A: 在选项页面中，点击预设值旁的"编辑"按钮。

### Q: 如何删除预设值？
A: 在选项页面中，点击预设值旁的"删除"按钮。

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 项目文件

- `src/` - 源代码目录
  - `manifest.json` - 扩展清单
  - `options.html` - 选项页面
  - `options.ts` - Vue 应用入口
  - `OptionsApp.vue` - Vue 组件
  - `content.ts` - Content Script
  - `content.css` - 样式

- `dist/` - 构建输出目录（加载到 Chrome 时使用）

- `README.md` - 详细文档
- `TESTING.md` - 测试指南
- `DEVELOPMENT_SUMMARY.md` - 开发总结

## 下一步

- 查看 `README.md` 了解详细功能
- 查看 `TESTING.md` 了解如何测试
- 查看 `DEVELOPMENT_SUMMARY.md` 了解技术细节

## 需要帮助？

1. 检查浏览器控制台是否有错误（F12 → Console）
2. 查看 `TESTING.md` 中的故障排除部分
3. 确保 `dist` 目录中有所有必要的文件

