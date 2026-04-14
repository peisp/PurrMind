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

  // 未完成的排前面，按创建时间倒序
  const pending = todos.filter(t => !t.completed).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const completed = todos.filter(t => t.completed).sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt))

  return {
    title,
    todos: [...pending, ...completed],
    pendingCount: pending.length,
    completedCount: completed.length
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
