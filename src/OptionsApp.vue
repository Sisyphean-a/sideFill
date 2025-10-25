<template>
  <div class="container">
    <h1>🎯 Hover-Fill Sidebar 配置</h1>
    
    <div :class="['message', { show: message.show }, message.type]" v-if="message.show">
      {{ message.text }}
    </div>
    
    <!-- 样式设置区域 -->
    <div class="form-section">
      <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">🎨 样式设置</h2>

      <div class="form-group">
        <label for="sidebarWidth">侧边栏宽度 (px): {{ styleSettings.sidebarWidth }}</label>
        <input
          v-model.number="styleSettings.sidebarWidth"
          type="range"
          id="sidebarWidth"
          min="200"
          max="500"
          step="10"
          @change="saveStyleSettings"
        >
      </div>

      <div class="form-group">
        <label for="primaryColor">主题颜色</label>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input
            v-model="styleSettings.primaryColor"
            type="color"
            id="primaryColor"
            @change="saveStyleSettings"
          >
          <span style="color: #666; font-size: 14px;">{{ styleSettings.primaryColor }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="fontSize">字体大小 (px): {{ styleSettings.fontSize }}</label>
        <input
          v-model.number="styleSettings.fontSize"
          type="range"
          id="fontSize"
          min="10"
          max="18"
          step="1"
          @change="saveStyleSettings"
        >
      </div>

      <div class="form-group">
        <label for="hoverDuration">悬停等待时长 (秒): {{ (styleSettings.hoverDuration / 1000).toFixed(1) }}</label>
        <input
          v-model.number="styleSettings.hoverDuration"
          type="range"
          id="hoverDuration"
          min="500"
          max="3000"
          step="100"
          @change="saveStyleSettings"
        >
        <small style="color: #999; font-size: 12px; margin-top: 5px; display: block;">
          鼠标悬停多久后自动填充内容 (0.5秒 - 3秒)
        </small>
      </div>
    </div>

    <!-- 分类管理区域 -->
    <div class="form-section">
      <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">📁 分类管理</h2>

      <div class="form-group">
        <label for="newCategory">新建分类</label>
        <div style="display: flex; gap: 10px;">
          <input
            v-model="newCategory"
            type="text"
            id="newCategory"
            placeholder="例如：工作、个人"
            @keyup.enter="addCategory"
            style="flex: 1;"
          >
          <button class="btn-primary" @click="addCategory">添加分类</button>
        </div>
      </div>

      <div v-if="categories.length > 0" class="category-list">
        <div v-for="category in categories" :key="category" class="category-item">
          <span>{{ category }}</span>
          <button class="btn-danger" @click="deleteCategory(category)">删除</button>
        </div>
      </div>
      <div v-else class="empty-hint">
        暂无分类，可以添加分类来组织预设值
      </div>
    </div>

    <div class="form-section">
      <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">添加新预设值</h2>

      <div class="form-group">
        <label for="label">标签 (Label)</label>
        <input
          v-model="newItem.label"
          type="text"
          id="label"
          placeholder="例如：我的邮箱"
          @keyup.enter="addItem"
        >
      </div>

      <div class="form-group">
        <label for="value">值 (Value)</label>
        <input
          v-model="newItem.value"
          type="text"
          id="value"
          placeholder="例如：example@123.com"
          @keyup.enter="addItem"
        >
      </div>

      <div class="form-group">
        <label for="category">分类 (可选)</label>
        <select v-model="newItem.category" id="category">
          <option value="">无分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="shortcut">快捷键 (可选)</label>
        <input
          v-model="newItem.shortcut"
          type="text"
          id="shortcut"
          placeholder="例如：Ctrl+Shift+1 或 Alt+E"
          @keydown="captureShortcut"
          readonly
          style="cursor: pointer;"
        >
        <small style="color: #999; font-size: 12px; margin-top: 5px; display: block;">
          点击输入框后按下组合键来设置快捷键
        </small>
      </div>

      <div class="button-group">
        <button class="btn-primary" @click="addItem">{{ editingIndex !== null ? '更新' : '添加' }}</button>
        <button class="btn-secondary" @click="resetForm">清空</button>
      </div>
    </div>
    
    <div class="list-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
        <h2 style="margin: 0;">已保存的预设值 ({{ filteredItems.length }})</h2>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <div class="category-filter">
            <label for="categoryFilter" style="margin-right: 10px;">筛选分类:</label>
            <select v-model="selectedCategory" id="categoryFilter">
              <option value="all">全部 ({{ items.length }})</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }} ({{ items.filter(i => i.category === category).length }})
              </option>
              <option value="">未分类 ({{ items.filter(i => !i.category).length }})</option>
            </select>
          </div>
          <div class="import-export-buttons">
            <button class="btn-secondary" @click="exportPresets">📤 导出</button>
            <button class="btn-secondary" @click="triggerImport">📥 导入</button>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="importPresets"
              style="display: none;"
            >
          </div>
        </div>
      </div>

      <div v-if="filteredItems.length === 0" class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>{{ selectedCategory === 'all' ? '还没有保存任何预设值，请添加一个吧！' : '该分类下暂无预设值' }}</p>
      </div>

      <div v-else>
        <div v-for="(item, index) in filteredItems" :key="index" class="list-item">
          <div class="list-item-content">
            <div class="list-item-label">
              {{ item.label }}
              <span v-if="item.category" class="category-badge">{{ item.category }}</span>
              <span v-if="item.shortcut" class="shortcut-badge">⌨️ {{ item.shortcut }}</span>
            </div>
            <div class="list-item-value">{{ item.value }}</div>
          </div>
          <div class="list-item-actions">
            <button class="btn-edit" @click="editItem(items.indexOf(item))">编辑</button>
            <button class="btn-danger" @click="deleteItem(items.indexOf(item))">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface PresetItem {
  label: string
  value: string
  category?: string
  shortcut?: string
}

interface Message {
  show: boolean
  text: string
  type: 'success' | 'error'
}

const items = ref<PresetItem[]>([])
const newItem = ref<PresetItem>({ label: '', value: '', category: '' })
const message = ref<Message>({ show: false, text: '', type: 'success' })
const editingIndex = ref<number | null>(null)
const categories = ref<string[]>([])
const newCategory = ref<string>('')
const selectedCategory = ref<string>('all')

// 样式设置
interface StyleSettings {
  sidebarWidth: number
  primaryColor: string
  fontSize: number
  hoverDuration: number
}

const styleSettings = ref<StyleSettings>({
  sidebarWidth: 300,
  primaryColor: '#4CAF50',
  fontSize: 13,
  hoverDuration: 1000
})

const fileInput = ref<HTMLInputElement | null>(null)

// 加载数据
onMounted(async () => {
  try {
    const result = await chrome.storage.local.get(['presets', 'categories', 'styleSettings'])
    if (result.presets) {
      // 处理两种格式：数组或对象
      if (Array.isArray(result.presets)) {
        items.value = result.presets
      } else if (typeof result.presets === 'object') {
        // 将对象转换为数组
        items.value = Object.values(result.presets)
      }
    }
    if (result.categories && Array.isArray(result.categories)) {
      categories.value = result.categories
    }
    if (result.styleSettings) {
      styleSettings.value = { ...styleSettings.value, ...result.styleSettings }
    }
  } catch (error) {
    console.error('Failed to load presets:', error)
  }
})

// 计算属性：根据选中的分类过滤预设值
const filteredItems = computed(() => {
  if (selectedCategory.value === 'all') {
    return items.value
  }
  return items.value.filter(item => item.category === selectedCategory.value)
})

// 显示消息
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}

// 保存数据到存储
const saveToStorage = async () => {
  try {
    await chrome.storage.local.set({
      presets: items.value,
      categories: categories.value,
      styleSettings: styleSettings.value
    })
  } catch (error) {
    console.error('Failed to save presets:', error)
    showMessage('保存失败，请重试', 'error')
  }
}

// 保存样式设置
const saveStyleSettings = async () => {
  await saveToStorage()
  showMessage('样式设置已保存', 'success')
}

// 添加分类
const addCategory = async () => {
  if (!newCategory.value.trim()) {
    showMessage('分类名称不能为空', 'error')
    return
  }
  if (categories.value.includes(newCategory.value.trim())) {
    showMessage('分类已存在', 'error')
    return
  }
  categories.value.push(newCategory.value.trim())
  await saveToStorage()
  showMessage('分类已添加', 'success')
  newCategory.value = ''
}

// 删除分类
const deleteCategory = async (category: string) => {
  if (confirm(`确定要删除分类"${category}"吗？该分类下的预设值不会被删除。`)) {
    categories.value = categories.value.filter(c => c !== category)
    await saveToStorage()
    showMessage('分类已删除', 'success')
    if (selectedCategory.value === category) {
      selectedCategory.value = 'all'
    }
  }
}

// 添加项目
const addItem = async () => {
  if (!newItem.value.label.trim() || !newItem.value.value.trim()) {
    showMessage('标签和值都不能为空', 'error')
    return
  }
  
  if (editingIndex.value !== null) {
    // 编辑模式
    items.value[editingIndex.value] = { ...newItem.value }
    editingIndex.value = null
    showMessage('预设值已更新', 'success')
  } else {
    // 添加模式
    items.value.push({ ...newItem.value })
    showMessage('预设值已添加', 'success')
  }
  
  await saveToStorage()
  resetForm()
}

// 编辑项目
const editItem = (index: number) => {
  newItem.value = { ...items.value[index] }
  editingIndex.value = index
  document.getElementById('label')?.focus()
}

// 删除项目
const deleteItem = async (index: number) => {
  if (confirm('确定要删除这个预设值吗？')) {
    items.value.splice(index, 1)
    await saveToStorage()
    showMessage('预设值已删除', 'success')
  }
}

// 重置表单
const resetForm = () => {
  newItem.value = { label: '', value: '', category: '', shortcut: '' }
  editingIndex.value = null
}

// 捕获快捷键
const captureShortcut = (event: KeyboardEvent) => {
  event.preventDefault()

  const keys: string[] = []

  if (event.ctrlKey) keys.push('Ctrl')
  if (event.altKey) keys.push('Alt')
  if (event.shiftKey) keys.push('Shift')
  if (event.metaKey) keys.push('Meta')

  // 获取实际按键
  const key = event.key
  if (key && !['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    keys.push(key.toUpperCase())
  }

  if (keys.length > 1) {
    const shortcut = keys.join('+')

    // 检查快捷键是否已被使用
    const existingIndex = items.value.findIndex((item, idx) =>
      item.shortcut === shortcut && idx !== editingIndex.value
    )

    if (existingIndex !== -1) {
      showMessage(`快捷键 ${shortcut} 已被 "${items.value[existingIndex].label}" 使用`, 'error')
      return
    }

    newItem.value.shortcut = shortcut
  }
}

// 导出预设值
const exportPresets = () => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    presets: items.value,
    categories: categories.value
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hover-fill-presets-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  showMessage('预设值已导出', 'success')
}

// 触发文件选择
const triggerImport = () => {
  fileInput.value?.click()
}

// 导入预设值
const importPresets = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    // 验证数据格式
    if (!data.presets || !Array.isArray(data.presets)) {
      showMessage('无效的文件格式', 'error')
      return
    }

    // 询问用户是合并还是替换
    const merge = confirm('是否合并导入?\n点击"确定"合并到现有预设值,点击"取消"替换所有预设值')

    if (merge) {
      // 合并模式:添加不重复的预设值
      let addedCount = 0
      data.presets.forEach((preset: PresetItem) => {
        const exists = items.value.some(item =>
          item.label === preset.label && item.value === preset.value
        )
        if (!exists) {
          items.value.push(preset)
          addedCount++
        }
      })

      // 合并分类
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach((category: string) => {
          if (!categories.value.includes(category)) {
            categories.value.push(category)
          }
        })
      }

      showMessage(`成功导入 ${addedCount} 个预设值`, 'success')
    } else {
      // 替换模式
      items.value = data.presets
      if (data.categories && Array.isArray(data.categories)) {
        categories.value = data.categories
      }
      showMessage(`成功导入 ${data.presets.length} 个预设值`, 'success')
    }

    await saveToStorage()
  } catch (error) {
    console.error('Import error:', error)
    showMessage('导入失败,请检查文件格式', 'error')
  } finally {
    // 清空文件选择
    target.value = ''
  }
}
</script>

<style scoped>
h2 {
  color: #333;
  font-size: 18px;
  margin-bottom: 15px;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
}

.category-item span {
  color: #333;
}

.category-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #4CAF50;
  color: white;
  border-radius: 3px;
  font-size: 11px;
  margin-left: 8px;
  font-weight: normal;
}

.shortcut-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #FF9800;
  color: white;
  border-radius: 3px;
  font-size: 11px;
  margin-left: 8px;
  font-weight: normal;
}

.empty-hint {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  color: #999;
  font-size: 13px;
  text-align: center;
  margin-top: 10px;
}

.category-filter select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.category-filter select:focus {
  outline: none;
  border-color: #4CAF50;
}

.btn-edit {
  background: #2196F3;
  color: white;
  padding: 8px 16px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit:hover {
  background: #0b7dda;
}

select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
  border: none;
}

input[type="color"] {
  width: 60px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.import-export-buttons {
  display: flex;
  gap: 8px;
}

.import-export-buttons button {
  padding: 8px 16px;
  font-size: 13px;
}
</style>

