
### **项目：悬停填充侧边栏 (Hover-Fill Sidebar) 扩展**

### 1. 项目概述

开发一个 Chrome 浏览器扩展。此扩展在浏览器窗口的最右侧边缘生成一个 2px 宽的触碰区域。当鼠标悬停在此区域时，会滑出一个侧边栏面板。面板中包含多行预设的文本值（如用户名、邮箱、地址等）。当鼠标悬停在任意一行上超过1秒钟时，该行的值将自动填充到当前网页上处于活动状态（focused）的输入框中，此过程无需点击。

### 2. 目标与场景

* **目标：** 提供一种比浏览器自带自动填充更可控、更快捷的数据输入方式。
* **场景：** 用户在填写各种网页表单时，需要重复输入相同的信息。用户希望通过“肌肉记忆”（鼠标甩到最右侧）快速调出数据，并通过“悬停”而非“点击”来完成填充，以避免输入框失去焦点或触发不必要的网页事件。

### 3. 技术栈与工具推荐

| 类别 | 推荐技术 | 理由 |
| :--- | :--- | :--- |
| **核心** | JavaScript (ES6+) / **TypeScript** | 扩展开发的基础。推荐使用 TypeScript 增加代码健壮性，尤其是在处理存储数据和 DOM 交互时。 |
| **清单版本** | **Manifest V3 (MV3)** | 谷歌扩展的现行标准，必须使用。 |
| **UI 框架** | **Vue 3 + Vite** | 你提到了 Vue 3，它非常适合！**但用途需要划分：** |
| | 1. **选项页面 (Options Page):** **强烈推荐**使用 Vue 3。这是一个独立的网页，Vite + Vue 3 可以快速构建一个功能完善的 CRUD 界面，用于管理预设值。 |
| | 2. **侧边栏 (Content Script UI):** **不推荐**。在 Content Script 中注入一个完整的 Vue 实例开销较大且配置复杂。 |
| **侧边栏 UI** | **原生 JavaScript + Shadow DOM** | **这是项目的关键。** 使用原生 JS 来创建侧边栏 UI，并将其封装在 Shadow DOM 中，以实现完美的样式隔离。 |
| **构建工具** | **Vite** | 速度快，配置简单。使用 `vite-plugin-crx` 这样的插件可以极大简化 Chrome 扩展的打包和热重载流程。 |
| **数据存储** | `chrome.storage.local` | 扩展专用的本地存储 API，用于持久化用户保存的预设值。 |

---

### 4. 扩展架构设计

你的扩展将主要由以下几个部分组成：

1.  **`manifest.json` (核心清单)**
    * 声明 `manifest_version: 3`。
    * 声明 **`permissions` (权限)**:
        * `storage`: 允许读写 `chrome.storage` 来保存用户数据。
    * 声明 **`host_permissions` (主机权限)**:
        * `"<all_urls>"`: 允许 Content Script 注入到所有网页中。
    * 声明 **`options_ui` (选项页面)**:
        * `"page": "options.html"`: 指向你的 Vue 3 应用，让用户可以管理数据。
    * 声明 **`content_scripts` (内容脚本)**:
        * `"matches": ["<all_urls>"]`: 匹配所有页面。
        * `"js": ["content.js"]`: 要注入的 JS 文件。
        * `"css": ["content.css"]`: （可选）用于注入 Shadow DOM 宿主元素的最小样式。

2.  **Options Page (选项页面 - `options.html` / `options.js`)**
    * 这是一个使用 **Vue 3** 构建的完整单页应用 (SPA)。
    * **功能：**
        * 提供一个表单，允许用户添加“标签”（如：我的邮箱）和“值”（如：`example@123.com`）。
        * 提供一个列表，展示所有已保存的“标签/值”对。
        * 提供编辑和删除功能。
    * **数据流：**
        * 页面加载时，通过 `chrome.storage.local.get()` 读取所有数据并展示在列表中。
        * 当用户保存、编辑或删除时，通过 `chrome.storage.local.set()` 将更新后的完整数据列表写回存储。

3.  **Content Script (内容脚本 - `content.js`)**
    * 这是扩展的**核心执行体**，使用**原生 JavaScript** 编写。
    * 它将在每个符合 `matches` 条件的页面加载时自动执行。

---

### 5. 关键功能点实现思路 (How-To)

#### 5.1. 跟踪当前激活的输入框

* 在 `content.js` 中，你需要一个全局变量，例如 `let activeInput = null;`。
* 在 `document` 级别监听 `focusin` 事件。
* 当事件触发时，检查 `event.target` 是否为 `<input>` 或 `<textarea>`。如果是，就将其赋值给 `activeInput`。

#### 5.2. 注入 UI（触发器 + 侧边栏）

* **关键点：使用 Shadow DOM 进行样式隔离。**
* **步骤：**
    1.  `content.js` 创建一个宿主元素：`const hostElement = document.createElement('div');`。
    2.  将其附加到 `document.body`。
    3.  创建 Shadow Root：`const shadowRoot = hostElement.attachShadow({ mode: 'open' });`。
    4.  **所有**你的 UI 元素（2px 触发条、侧边栏面板、所有行）都应该被 `appendChild` 到 `shadowRoot` 中，而不是 `document.body`。
    5.  你的 CSS 样式（例如侧边栏的 `position: fixed` 等）也应该通过创建一个 `<style>` 标签并将其 `appendChild` 到 `shadowRoot` 中。

#### 5.3. 数据加载与侧边栏渲染

1.  `content.js` 在启动时，调用 `chrome.storage.local.get()` 获取用户在选项页保存的数据。
2.  获取到数据后，使用原生 JS 循环（`forEach`）这个数据数组。
3.  为每一条数据创建一个 `div`（行元素），设置 `textContent` 为数据的“标签”。
4.  将这个 `div` 添加到 `shadowRoot` 内的侧边栏面板中。

#### 5.4. 核心交互逻辑（悬停触发）

1.  **触发器 (2px 区域) 交互：**
    * 为 2px 触发条（在 Shadow DOM 内）添加 `mouseenter` 事件监听：显示侧边栏面板。
    * 为整个侧边栏面板添加 `mouseleave` 事件监听：隐藏侧边栏面板。

2.  **行 (Row) 交互（你设计的核心功能）：**
    * 在 `5.3` 步循环创建行 `div` 时，为**每一行**都添加以下逻辑：
    * 设置一个定时器变量：`let hoverTimer = null;`。
    * **添加 `mouseenter` 监听：**
        * 启动一个 `setTimeout`：`hoverTimer = setTimeout(() => { ... }, 1000);`。
        * `setTimeout` 的回调函数中，执行填充逻辑。
    * **添加 `mouseleave` 监听：**
        * **必须**清除定时器：`clearTimeout(hoverTimer);`。
        * （这确保了鼠标只是快速划过，而没有停留 1 秒时，不会触发填充）。

#### 5.5. 填充输入框（关键点）

* `setTimeout` 的回调函数需要调用一个 `fillInput(value)` 函数。
* 这个函数必须做两件事，才能**兼容 React、Vue 等现代框架**：
    1.  **检查目标：** `if (!activeInput) return;` （如果用户没有选中任何输入框，则不执行任何操作）。
    2.  **赋值：** `activeInput.value = value;`。
    3.  **派发事件 (最关键)：**
        * `activeInput.dispatchEvent(new Event('input', { bubbles: true }));`
        * `activeInput.dispatchEvent(new Event('change', { bubbles: true }));`
    * （*为什么？* 现代框架不监听 `value` 属性的程序化更改，它们只监听 `input` 或 `change` 事件。）

---

### 6. 开发流程 (Workflow)

1.  **步骤 1: 环境搭建**
    * 使用 Vite 创建一个项目（可以选择 Vue 模板，Vite 默认会处理 TS）。
    * 安装 `vite-plugin-crx` 并配置 `vite.config.js`，将其设置为 MV3 模式，并定义好入口点（`options.html` 和 `content.js`）。
    * 创建 `manifest.json` 文件并配置好 `permissions` 和 `options_ui`。

2.  **步骤 2: 开发选项页 (Vue 3)**
    * 在 `options.html` 和对应的 `*.js/ts` 中，使用 Vue 3 开发数据管理界面。
    * 重点测试 `chrome.storage.local` 的 `get` 和 `set` 功能是否正常。

3.  **步骤 3: 开发 Content Script (原生 JS/TS)**
    * 编写 `content.js`。
    * 实现 `focusin` 监听器，用于跟踪 `activeInput`。
    * 实现 Shadow DOM 的创建逻辑。
    * 实现 UI 注入（触发条和空的侧边栏）。

4.  **步骤 4: 联调（数据与交互）**
    * 在 `content.js` 中，添加 `chrome.storage.local.get()` 逻辑，读取数据。
    * 实现动态创建“行”元素。
    * 为“行”元素添加 `mouseenter` / `mouseleave` / `setTimeout` / `clearTimeout` 的核心逻辑。
    * 实现 `fillInput()` 函数，包含 `dispatchEvent` 步骤。

5.  **步骤 5: 测试与打包**
    * 使用 `vite build --watch` 启动开发模式。
    * 在 `chrome://extensions` 中加载 `dist` 文件夹（已解压的扩展）。
    * **测试场景：**
        * 在选项页添加/删除数据，看侧边栏是否（刷新后）同步更新。
        * 在普通 HTML 页面（如 `example.com`）测试填充。
        * **在复杂页面（如 GMail、Facebook、React/Vue 写的网站）测试填充**，确保 `dispatchEvent` 逻辑生效。
        * 测试样式隔离，确保你的侧边栏不会被网页 CSS 破坏。
    * 确认无误后，运行 `vite build` 打包成 `zip` 文件准备发布。