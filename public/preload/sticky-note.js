const { ipcRenderer } = require('electron')
const { dbStorage } = window.utools

const TODO_DB_NAME = 'todos'
const CATEGORIES_DB_NAME = 'categories'

const getAllTodos = () => dbStorage.getItem(TODO_DB_NAME) || []
const getAllCategories = () => dbStorage.getItem(CATEGORIES_DB_NAME) || []

// 切换待办事项状态
const toggleTodoStatus = (id) => {
  const todos = getAllTodos()
  const index = todos.findIndex((t) => t.id === id)
  if (index === -1) return null
  todos[index].completed = !todos[index].completed
  todos[index].updatedAt = new Date().toISOString()
  todos[index].completedAt = todos[index].completed ? new Date().toISOString() : null
  dbStorage.setItem(TODO_DB_NAME, todos)
  return todos[index]
}

// 根据筛选条件获取待办数据
function getStickyNoteData(filter, categoryId) {
  let todos = getAllTodos()
  const categories = getAllCategories()
  let title = '全部'

  if (categoryId) {
    const category = categories.find(c => c.id === categoryId)
    title = category ? category.name : '未知列表'
    todos = todos.filter(t => t.categoryId === categoryId)
  } else if (filter) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (filter) {
      case 'today':
        title = '今天'
        todos = todos.filter(t => {
          if (!t.dueDate) return false
          const d = new Date(t.dueDate)
          d.setHours(0, 0, 0, 0)
          return d.getTime() === today.getTime()
        })
        break
      case 'planned':
        title = '计划'
        todos = todos.filter(t => {
          if (!t.dueDate) return false
          const d = new Date(t.dueDate)
          d.setHours(0, 0, 0, 0)
          return d.getTime() > today.getTime()
        })
        break
      case 'starred':
        title = '收藏'
        todos = todos.filter(t => t.starred)
        break
      case 'completed':
        title = '已完成'
        todos = todos.filter(t => t.completed)
        break
      case 'all':
      default:
        title = '全部'
        break
    }
  }

  // 排序逻辑与主界面 TimelineView 完全一致：
  // 1. sortTodos 排序
  // 2. 按天分组（取 dueDate || reminderTime || createdAt 的日期）
  // 3. 天按倒序排列（最新的天在前）
  // 4. 展平为最终列表
  const sorted = [...todos].sort((a, b) => {
    if (a.completedAt && !b.completedAt) return 1
    if (!a.completedAt && b.completedAt) return -1

    const isCompleted = !!a.completedAt && !!b.completedAt

    if (!isCompleted) {
      if (a.dueDate && b.dueDate) {
        const dateCompare = new Date(a.dueDate) - new Date(b.dueDate)
        if (dateCompare !== 0) return dateCompare
      } else if (a.dueDate) return -1
      else if (b.dueDate) return 1

      if (a.reminderTime && b.reminderTime) {
        const reminderCompare = new Date(a.reminderTime) - new Date(b.reminderTime)
        if (reminderCompare !== 0) return reminderCompare
      } else if (a.reminderTime) return -1
      else if (b.reminderTime) return 1

      return new Date(a.createdAt) - new Date(b.createdAt)
    } else {
      return new Date(b.completedAt) - new Date(a.completedAt)
    }
  })

  // 按天分组再按天倒序展平（与 TimelineView.groupTodosByDay + days.sort 一致）
  const getDay = (t) => {
    const time = t.dueDate || t.reminderTime || t.createdAt
    const d = new Date(time)
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }
  const groups = {}
  sorted.forEach(t => {
    const day = getDay(t)
    if (!groups[day]) groups[day] = []
    groups[day].push(t)
  })
  const days = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a))
  const finalTodos = days.flatMap(day => groups[day])

  const pendingCount = finalTodos.filter(t => !t.completedAt).length
  const completedCount = finalTodos.filter(t => !!t.completedAt).length

  return {
    title,
    todos: finalTodos,
    pendingCount,
    completedCount,
    filter: categoryId ? 'category' : (filter || 'all')
  }
}

// 存储当前便签的筛选参数和唯一 ID
let currentFilter = null
let currentCategoryId = null
let noteId = null

// 接收父窗口发来的初始化参数
ipcRenderer.on('sticky-init', (event, params) => {
  currentFilter = params.filter || 'all'
  currentCategoryId = params.categoryId || null
  noteId = params.noteId
  refreshData()
})

// 接收主插件发来的数据刷新通知（双向同步）
ipcRenderer.on('sticky-refresh', () => {
  refreshData()
})

// 刷新数据并通知页面
function refreshData() {
  const data = getStickyNoteData(currentFilter, currentCategoryId)
  window.dispatchEvent(new CustomEvent('sticky-data-ready', { detail: data }))
}

// 暴露给页面脚本，使用 noteId 作为 channel 后缀隔离多窗口
window.stickyNote = {
  toggleTodoStatus(id) {
    toggleTodoStatus(id)
    // 切换后通知主插件刷新
    if (noteId) {
      window.utools.sendToParent('todo-changed:' + noteId)
    }
    refreshData()
  },
  refreshData,
  togglePin(pinned) {
    if (noteId) {
      window.utools.sendToParent('toggle-pin:' + noteId, pinned)
    }
  },
  closeWindow() {
    if (noteId) {
      window.utools.sendToParent('close-window:' + noteId)
    }
  }
}
