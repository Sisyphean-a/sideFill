/// <reference types="chrome" />

// 跟踪当前活动的输入框
let activeInput: HTMLInputElement | HTMLTextAreaElement | null = null

// 缓存机制
interface CachedData {
  presets: any[]
  categories: string[]
  timestamp: number
}

let cachedData: CachedData | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存有效期

// 获取缓存的预设值
function getCachedPresets(callback: (presets: any[], categories: string[]) => void): void {
  const now = Date.now()

  // 检查缓存是否有效
  if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    console.log('Using cached presets')
    callback(cachedData.presets, cachedData.categories)
    return
  }

  // 缓存失效,从存储读取
  console.log('Cache miss, loading from storage')
  chrome.storage.local.get(['presets', 'categories'], (result: Record<string, any>) => {
    let presets: any[] = []
    let categories: string[] = []

    if (result.presets) {
      if (Array.isArray(result.presets)) {
        presets = result.presets
      } else if (typeof result.presets === 'object') {
        presets = Object.values(result.presets)
      }
    }

    if (result.categories && Array.isArray(result.categories)) {
      categories = result.categories
    }

    // 更新缓存
    cachedData = {
      presets,
      categories,
      timestamp: now
    }

    callback(presets, categories)
  })
}

// 清除缓存
function clearCache(): void {
  cachedData = null
  console.log('Cache cleared')
}

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

// 样式设置
let sidebarWidth = 300
let primaryColor = '#4CAF50'
let fontSize = 13
let hoverDuration = 1000 // 默认1秒

// 生成侧边栏样式
function getSidebarStyles(): string {
  const hoverColor = adjustColor(primaryColor, -10)

  return `
    :host {
      --primary-color: ${primaryColor};
      --hover-color: ${hoverColor};
      --text-color: #333;
      --bg-color: #fff;
      --border-color: #ddd;
      --sidebar-width: ${sidebarWidth}px;
      --font-size: ${fontSize}px;
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

    .resize-handle {
      position: absolute;
      left: 0;
      top: 0;
      width: 5px;
      height: 100%;
      cursor: ew-resize;
      background: transparent;
      z-index: 10;
    }

    .resize-handle:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .sidebar {
      position: fixed;
      right: calc(-1 * var(--sidebar-width));
      top: 0;
      width: var(--sidebar-width);
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
      position: relative;
    }

    .preset-row:hover {
      background: #f5f5f5;
    }

    .preset-row.active {
      background: var(--primary-color);
      color: white;
    }

    .progress-container {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }

    .preset-row.active .progress-container {
      opacity: 1;
    }

    .progress-ring {
      transform: rotate(-90deg);
      display: block;
    }

    .progress-ring-circle {
      fill: none;
      stroke: white;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.016s linear;
    }

    .preset-label {
      font-weight: 600;
      font-size: var(--font-size);
      margin-bottom: 4px;
      padding-right: 40px;
    }

    .preset-value {
      font-size: calc(var(--font-size) - 1px);
      opacity: 0.8;
      word-break: break-all;
      padding-right: 40px;
    }

    .empty-state {
      padding: 30px 15px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }

    .category-header {
      padding: 10px 15px;
      background: #f0f0f0;
      font-weight: 600;
      font-size: 12px;
      color: #666;
      border-bottom: 1px solid #e0e0e0;
      position: sticky;
      top: 0;
      z-index: 1;
    }
  `
}

// 调整颜色亮度
function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

// 更新侧边栏样式
function updateSidebarStyles(shadowRoot: ShadowRoot): void {
  const styleElement = shadowRoot.getElementById('sidebar-style') as HTMLStyleElement
  if (styleElement) {
    styleElement.textContent = getSidebarStyles()
  }
}

// 创建 Shadow DOM UI
function initializeSidebar(): void {
  // 创建宿主元素
  const hostElement = document.createElement('div')
  hostElement.id = 'hover-fill-sidebar-host'
  document.body.appendChild(hostElement)

  // 创建 Shadow Root
  const shadowRoot = hostElement.attachShadow({ mode: 'open' })

  // 加载样式设置
  chrome.storage.local.get('styleSettings', (result: Record<string, any>) => {
    if (result.styleSettings) {
      sidebarWidth = result.styleSettings.sidebarWidth || 300
      primaryColor = result.styleSettings.primaryColor || '#4CAF50'
      fontSize = result.styleSettings.fontSize || 13
      hoverDuration = result.styleSettings.hoverDuration || 1000

      // 更新样式
      updateSidebarStyles(shadowRoot)
    }
  })

  // 创建样式
  const style = document.createElement('style')
  style.id = 'sidebar-style'
  style.textContent = getSidebarStyles()
  shadowRoot.appendChild(style)



  // 创建触发区域
  const triggerArea = document.createElement('div')
  triggerArea.className = 'trigger-area'
  shadowRoot.appendChild(triggerArea)

  // 创建侧边栏
  const sidebar = document.createElement('div')
  sidebar.className = 'sidebar'
  shadowRoot.appendChild(sidebar)

  // 创建拖拽手柄
  const resizeHandle = document.createElement('div')
  resizeHandle.className = 'resize-handle'
  sidebar.appendChild(resizeHandle)

  // 实现拖拽调整宽度
  let isResizing = false
  let startX = 0
  let startWidth = 0

  resizeHandle.addEventListener('mousedown', (e: MouseEvent) => {
    isResizing = true
    startX = e.clientX
    startWidth = sidebarWidth
    e.preventDefault()
  })

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isResizing) return

    const deltaX = startX - e.clientX
    const newWidth = Math.max(200, Math.min(500, startWidth + deltaX))

    sidebarWidth = newWidth
    updateSidebarStyles(shadowRoot)
  })

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false
      // 保存新宽度
      chrome.storage.local.get('styleSettings', (result: Record<string, any>) => {
        const settings = result.styleSettings || {}
        settings.sidebarWidth = sidebarWidth
        chrome.storage.local.set({ styleSettings: settings })
      })
    }
  })

  // 创建侧边栏头部
  const header = document.createElement('div')
  header.className = 'sidebar-header'
  header.textContent = '📋 预设值'
  sidebar.appendChild(header)

  // 创建内容容器
  const content = document.createElement('div')
  content.className = 'sidebar-content'
  sidebar.appendChild(content)

  // 使用缓存加载预设数据
  getCachedPresets((presets, categories) => {

    if (presets.length === 0) {
      const emptyState = document.createElement('div')
      emptyState.className = 'empty-state'
      emptyState.textContent = '暂无预设值\n请在选项页添加'
      content.appendChild(emptyState)
    } else {
      // 按分类组织预设值
      const categorizedPresets: Record<string, any[]> = {}
      const uncategorized: any[] = []

      presets.forEach((preset: { label: string; value: string; category?: string }) => {
        if (preset.category && categories.includes(preset.category)) {
          if (!categorizedPresets[preset.category]) {
            categorizedPresets[preset.category] = []
          }
          categorizedPresets[preset.category].push(preset)
        } else {
          uncategorized.push(preset)
        }
      })

      // 渲染预设值 (优化版本 - 使用data属性存储值)
      const renderPreset = (preset: { label: string; value: string; category?: string }) => {
        const row = document.createElement('div')
        row.className = 'preset-row'
        row.dataset.value = preset.value

        const label = document.createElement('div')
        label.className = 'preset-label'
        label.textContent = preset.label

        const value = document.createElement('div')
        value.className = 'preset-value'
        value.textContent = preset.value

        // 创建加载圈容器
        const progressContainer = document.createElement('div')
        progressContainer.className = 'progress-container'

        // 创建SVG圆形进度条
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('class', 'progress-ring')
        svg.setAttribute('width', '24')
        svg.setAttribute('height', '24')

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('class', 'progress-ring-circle')
        circle.setAttribute('cx', '12')
        circle.setAttribute('cy', '12')
        circle.setAttribute('r', '10')
        circle.setAttribute('stroke-width', '2')

        svg.appendChild(circle)
        progressContainer.appendChild(svg)

        row.appendChild(label)
        row.appendChild(value)
        row.appendChild(progressContainer)

        return row
      }

      // 使用事件委托处理悬停事件 (性能优化 - 减少事件监听器数量)
      let hoverTimer: ReturnType<typeof setTimeout> | null = null
      let activeRow: HTMLElement | null = null
      let progressInterval: ReturnType<typeof setInterval> | null = null

      const PROGRESS_STEPS = 60 // 60帧,约16.67ms每帧

      content.addEventListener('mouseenter', (e) => {
        const target = e.target as HTMLElement
        const row = target.closest('.preset-row') as HTMLElement

        if (row && row.dataset.value) {
          activeRow = row
          row.classList.add('active')

          // 获取进度圈元素
          const circle = row.querySelector('.progress-ring-circle') as SVGCircleElement
          if (circle) {
            const radius = 10
            const circumference = 2 * Math.PI * radius
            let progress = 0

            // 设置初始状态
            circle.style.strokeDasharray = `${circumference}`
            circle.style.strokeDashoffset = `${circumference}`

            // 启动进度动画 - 使用动态的悬停时长
            const stepDuration = hoverDuration / PROGRESS_STEPS
            progressInterval = setInterval(() => {
              progress++
              const offset = circumference - (progress / PROGRESS_STEPS) * circumference
              circle.style.strokeDashoffset = `${offset}`

              if (progress >= PROGRESS_STEPS) {
                if (progressInterval) {
                  clearInterval(progressInterval)
                  progressInterval = null
                }
              }
            }, stepDuration)
          }

          hoverTimer = setTimeout(() => {
            fillInput(row.dataset.value!)
            row.classList.remove('active')

            // 清理进度动画
            if (progressInterval) {
              clearInterval(progressInterval)
              progressInterval = null
            }
          }, hoverDuration)
        }
      }, true)

      content.addEventListener('mouseleave', (e) => {
        const target = e.target as HTMLElement
        const row = target.closest('.preset-row') as HTMLElement

        if (row && row === activeRow) {
          row.classList.remove('active')

          // 清理定时器
          if (hoverTimer) {
            clearTimeout(hoverTimer)
            hoverTimer = null
          }

          // 清理进度动画
          if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
          }

          // 重置进度圈
          const circle = row.querySelector('.progress-ring-circle') as SVGCircleElement
          if (circle) {
            circle.style.strokeDashoffset = `${2 * Math.PI * 10}`
          }

          activeRow = null
        }
      }, true)

      // 批量渲染优化 - 使用DocumentFragment减少重排
      const fragment = document.createDocumentFragment()

      // 渲染分类标题
      categories.forEach(category => {
        if (categorizedPresets[category] && categorizedPresets[category].length > 0) {
          const categoryHeader = document.createElement('div')
          categoryHeader.className = 'category-header'
          categoryHeader.textContent = `📁 ${category}`
          fragment.appendChild(categoryHeader)

          categorizedPresets[category].forEach(preset => {
            fragment.appendChild(renderPreset(preset))
          })
        }
      })

      // 渲染未分类的预设值
      if (uncategorized.length > 0) {
        if (categories.length > 0) {
          const categoryHeader = document.createElement('div')
          categoryHeader.className = 'category-header'
          categoryHeader.textContent = '📋 未分类'
          fragment.appendChild(categoryHeader)
        }

        uncategorized.forEach(preset => {
          fragment.appendChild(renderPreset(preset))
        })
      }

      // 一次性添加所有元素,减少DOM操作
      content.appendChild(fragment)
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

// 快捷键监听
let shortcutMap: Map<string, string> = new Map()

function initializeShortcuts(): void {
  getCachedPresets((presets) => {
    // 构建快捷键映射
    shortcutMap.clear()
    presets.forEach((preset: { label: string; value: string; shortcut?: string }) => {
      if (preset.shortcut) {
        shortcutMap.set(preset.shortcut, preset.value)
      }
    })
  })
}

// 监听键盘事件
document.addEventListener('keydown', (event: KeyboardEvent) => {
  // 只在输入框获得焦点时响应快捷键
  if (!activeInput) {
    return
  }

  const keys: string[] = []

  if (event.ctrlKey) keys.push('Ctrl')
  if (event.altKey) keys.push('Alt')
  if (event.shiftKey) keys.push('Shift')
  if (event.metaKey) keys.push('Meta')

  const key = event.key
  if (key && !['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    keys.push(key.toUpperCase())
  }

  if (keys.length > 1) {
    const shortcut = keys.join('+')
    const value = shortcutMap.get(shortcut)

    if (value) {
      event.preventDefault()
      fillInput(value)
      console.log('Filled input via shortcut:', shortcut)
    }
  }
})

// 监听存储变化以更新快捷键映射和样式
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.presets || changes.categories) {
      // 清除缓存,强制重新加载
      clearCache()
      initializeShortcuts()

      // 重新渲染侧边栏
      const hostElement = document.getElementById('hover-fill-sidebar-host')
      if (hostElement) {
        hostElement.remove()
        initializeSidebar()
      }
    }
    if (changes.styleSettings) {
      const settings = changes.styleSettings.newValue
      if (settings) {
        sidebarWidth = settings.sidebarWidth || 300
        primaryColor = settings.primaryColor || '#4CAF50'
        fontSize = settings.fontSize || 13
        hoverDuration = settings.hoverDuration || 1000

        const hostElement = document.getElementById('hover-fill-sidebar-host')
        if (hostElement && hostElement.shadowRoot) {
          updateSidebarStyles(hostElement.shadowRoot)
        }
      }
    }
  }
})

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar()
    initializeShortcuts()
  })
} else {
  initializeSidebar()
  initializeShortcuts()
}

