# 图标更新说明

## 问题解决

### 原始问题
Chrome 扩展加载时报错：
```
Could not load icon 'images/icon-16.png' specified in 'icons'.
无法加载清单。
```

### 解决方案

#### 1. 创建图标文件
- 在 `src/images/` 目录下创建了三个图标文件：
  - `icon-16.png` - 16x16 像素
  - `icon-48.png` - 48x48 像素
  - `icon-128.png` - 128x128 像素

- 使用你提供的 `icons8-fill-60.png` 作为源文件
- Chrome 会自动缩放图标到所需的尺寸

#### 2. 更新构建配置
- 修改 `vite.config.ts`，添加了图标复制逻辑
- 构建时自动将 `src/images/` 目录复制到 `dist/images/`

#### 3. 验证文件结构
```
dist/
├── manifest.json
├── options.html
├── options.js
├── options.css
├── content.js
├── content.css
└── images/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## 文件位置

| 文件 | 位置 |
|------|------|
| 源图标 | `src/images/icon-16.png` |
| 源图标 | `src/images/icon-48.png` |
| 源图标 | `src/images/icon-128.png` |
| 构建输出 | `dist/images/icon-16.png` |
| 构建输出 | `dist/images/icon-48.png` |
| 构建输出 | `dist/images/icon-128.png` |

## 如何自定义图标

### 方法 1：替换现有图标
1. 准备你的图标文件（PNG 格式）
2. 将其复制到 `src/images/` 目录
3. 重命名为 `icon-16.png`、`icon-48.png`、`icon-128.png`
4. 运行 `npm run build`

### 方法 2：使用不同的源文件
1. 将你的图标文件放在 `src/images/` 目录
2. 修改 `vite.config.ts` 中的复制逻辑
3. 运行 `npm run build`

## 构建和加载

### 构建
```bash
npm run build
```

### 加载到 Chrome
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 文件夹

现在应该能够正常加载扩展，不会出现图标错误。

## 验证

构建完成后，检查以下内容：
- ✅ `dist/images/` 目录存在
- ✅ `dist/images/` 中有三个图标文件
- ✅ `dist/manifest.json` 中的图标路径正确
- ✅ Chrome 能够正常加载扩展

## 注意事项

- 图标文件应该是 PNG 格式
- 建议使用透明背景
- Chrome 会自动缩放图标，所以不需要完全匹配尺寸
- 如果图标显示不正确，尝试清除 Chrome 缓存并重新加载扩展

