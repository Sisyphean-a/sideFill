/// <reference types="chrome" />

// 跟踪当前活动的输入框
let activeInput: HTMLInputElement | HTMLTextAreaElement | null = null

// 监听 focusin 事件来跟踪活动的输入框
document.addEventListener('focusin', (event) => {
  const target = event.target as HTMLElement
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    activeInput = target
  }
})

// 监听 focusout 事件
document.addEventListener('focusout', () => {
  activeInput = null
})

// 填充输入框的函数
function fillInput(value: string): void {
  if (!activeInput) {
    console.warn('No active input found')
    return
  }

  // 设置值
  activeInput.value = value

  // 派发事件以兼容现代框架（React、Vue 等）
  activeInput.dispatchEvent(new Event('input', { bubbles: true }))
  activeInput.dispatchEvent(new Event('change', { bubbles: true }))

  console.log('Filled input with:', value)
}

// 创建 Shadow DOM UI
function initializeSidebar(): void {
  // 创建宿主元素
  const hostElement = document.createElement('div')
  hostElement.id = 'hover-fill-sidebar-host'
  document.body.appendChild(hostElement)

  // 创建 Shadow Root
  const shadowRoot = hostElement.attachShadow({ mode: 'open' })

  // 创建样式
  const style = document.createElement('style')
  style.textContent = `
    :host {
      --primary-color: #4CAF50;
      --hover-color: #45a049;
      --text-color: #333;
      --bg-color: #fff;
      --border-color: #ddd;
    }

    .trigger-area {
      position: fixed;
      right: 0;
      top: 0;
      width: 2px;
      height: 100vh;
      cursor: pointer;
      z-index: 2147483646;
      background: transparent;
    }

    .sidebar {
      position: fixed;
      right: -300px;
      top: 0;
      width: 300px;
      height: 100vh;
      background: var(--bg-color);
      border-left: 1px solid var(--border-color);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
      transition: right 0.3s ease;
      z-index: 2147483645;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .sidebar.visible {
      right: 0;
    }

    .sidebar-header {
      padding: 15px;
      border-bottom: 1px solid var(--border-color);
      background: #f9f9f9;
      font-weight: 600;
      color: var(--text-color);
      font-size: 14px;
    }

    .sidebar-content {
      padding: 10px 0;
    }

    .preset-row {
      padding: 12px 15px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.2s;
      user-select: none;
    }

    .preset-row:hover {
      background: #f5f5f5;
    }

    .preset-row.active {
      background: var(--primary-color);
      color: white;
    }

    .preset-label {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .preset-value {
      font-size: 12px;
      opacity: 0.8;
      word-break: break-all;
    }

    .empty-state {
      padding: 30px 15px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  `
  shadowRoot.appendChild(style)

  // 创建触发区域
  const triggerArea = document.createElement('div')
  triggerArea.className = 'trigger-area'
  shadowRoot.appendChild(triggerArea)

  // 创建侧边栏
  const sidebar = document.createElement('div')
  sidebar.className = 'sidebar'
  shadowRoot.appendChild(sidebar)

  // 创建侧边栏头部
  const header = document.createElement('div')
  header.className = 'sidebar-header'
  header.textContent = '📋 预设值'
  sidebar.appendChild(header)

  // 创建内容容器
  const content = document.createElement('div')
  content.className = 'sidebar-content'
  sidebar.appendChild(content)

  // 加载预设数据
  chrome.storage.local.get('presets', (result: Record<string, any>) => {
    let presets: any[] = []
    if (result.presets) {
      // 处理两种格式：数组或对象
      if (Array.isArray(result.presets)) {
        presets = result.presets
      } else if (typeof result.presets === 'object') {
        // 将对象转换为数组
        presets = Object.values(result.presets)
      }
    }

    if (presets.length === 0) {
      const emptyState = document.createElement('div')
      emptyState.className = 'empty-state'
      emptyState.textContent = '暂无预设值\n请在选项页添加'
      content.appendChild(emptyState)
    } else {
      presets.forEach((preset: { label: string; value: string }) => {
        const row = document.createElement('div')
        row.className = 'preset-row'

        const label = document.createElement('div')
        label.className = 'preset-label'
        label.textContent = preset.label

        const value = document.createElement('div')
        value.className = 'preset-value'
        value.textContent = preset.value

        row.appendChild(label)
        row.appendChild(value)

        // 为每一行添加悬停逻辑
        let hoverTimer: ReturnType<typeof setTimeout> | null = null

        row.addEventListener('mouseenter', () => {
          row.classList.add('active')
          hoverTimer = setTimeout(() => {
            fillInput(preset.value)
            // 填充后移除 active 状态
            row.classList.remove('active')
          }, 1000)
        })

        row.addEventListener('mouseleave', () => {
          row.classList.remove('active')
          if (hoverTimer) {
            clearTimeout(hoverTimer)
            hoverTimer = null
          }
        })

        content.appendChild(row)
      })
    }
  })

  // 触发区域交互
  triggerArea.addEventListener('mouseenter', () => {
    sidebar.classList.add('visible')
  })

  sidebar.addEventListener('mouseleave', () => {
    sidebar.classList.remove('visible')
  })
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSidebar)
} else {
  initializeSidebar()
}

