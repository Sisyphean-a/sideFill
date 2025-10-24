<template>
  <div class="container">
    <h1>🎯 Hover-Fill Sidebar 配置</h1>
    
    <div :class="['message', { show: message.show }, message.type]" v-if="message.show">
      {{ message.text }}
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
      
      <div class="button-group">
        <button class="btn-primary" @click="addItem">添加</button>
        <button class="btn-secondary" @click="resetForm">清空</button>
      </div>
    </div>
    
    <div class="list-section">
      <h2>已保存的预设值 ({{ items.length }})</h2>
      
      <div v-if="items.length === 0" class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>还没有保存任何预设值，请添加一个吧！</p>
      </div>
      
      <div v-else>
        <div v-for="(item, index) in items" :key="index" class="list-item">
          <div class="list-item-content">
            <div class="list-item-label">{{ item.label }}</div>
            <div class="list-item-value">{{ item.value }}</div>
          </div>
          <div class="list-item-actions">
            <button class="btn-danger" @click="editItem(index)">编辑</button>
            <button class="btn-danger" @click="deleteItem(index)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface PresetItem {
  label: string
  value: string
}

interface Message {
  show: boolean
  text: string
  type: 'success' | 'error'
}

const items = ref<PresetItem[]>([])
const newItem = ref<PresetItem>({ label: '', value: '' })
const message = ref<Message>({ show: false, text: '', type: 'success' })
const editingIndex = ref<number | null>(null)

// 加载数据
onMounted(async () => {
  try {
    const result = await chrome.storage.local.get('presets')
    if (result.presets) {
      // 处理两种格式：数组或对象
      if (Array.isArray(result.presets)) {
        items.value = result.presets
      } else if (typeof result.presets === 'object') {
        // 将对象转换为数组
        items.value = Object.values(result.presets)
      }
    }
  } catch (error) {
    console.error('Failed to load presets:', error)
  }
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
    await chrome.storage.local.set({ presets: items.value })
  } catch (error) {
    console.error('Failed to save presets:', error)
    showMessage('保存失败，请重试', 'error')
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
  newItem.value = { label: '', value: '' }
  editingIndex.value = null
}
</script>

<style scoped>
h2 {
  color: #333;
  font-size: 18px;
  margin-bottom: 15px;
}
</style>

