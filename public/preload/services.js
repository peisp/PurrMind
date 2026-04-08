const { dbStorage } = window.utools

const TODO_DB_NAME = 'todos'
const CATEGORIES_DB_NAME = 'categories'

// 初始化数据库
const initDB = () => {
  if (!dbStorage.getItem(TODO_DB_NAME)) {
    dbStorage.setItem(TODO_DB_NAME, [])
  }
  if (!dbStorage.getItem(CATEGORIES_DB_NAME)) {
    dbStorage.setItem(CATEGORIES_DB_NAME, [])
  }
}

// ========== 基础 CRUD ==========

const getAllTodos = () => dbStorage.getItem(TODO_DB_NAME) || []
const getAllCategories = () => dbStorage.getItem(CATEGORIES_DB_NAME) || []

const addTodo = (todo) => {
  const todos = getAllTodos()
  const newTodo = {
    id: Date.now().toString(),
    title: todo.title,
    description: todo.description || '',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: todo.categoryId || null,
    dueDate: todo.dueDate || null,
    reminderTime: todo.reminderTime || null,
    starred: todo.starred || false
  }
  todos.push(newTodo)
  dbStorage.setItem(TODO_DB_NAME, todos)
  return newTodo
}

const updateTodo = (id, updates) => {
  const todos = getAllTodos()
  const index = todos.findIndex((t) => t.id === id)
  if (index === -1) return null
  todos[index] = { ...todos[index], ...updates, updatedAt: new Date().toISOString() }
  if (updates.completed === true) {
    todos[index].completedAt = new Date().toISOString()
  } else if (updates.completed === false) {
    todos[index].completedAt = null
  }
  dbStorage.setItem(TODO_DB_NAME, todos)
  return todos[index]
}

const deleteTodo = (id) => {
  const todos = getAllTodos()
  dbStorage.setItem(
    TODO_DB_NAME,
    todos.filter((t) => t.id !== id)
  )
}

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

const addCategory = (category) => {
  const categories = getAllCategories()
  const newCategory = {
    id: Date.now().toString(),
    name: category.name,
    icon: category.icon || 'FolderIcon',
    color: category.color || 'default',
    createdAt: new Date().toISOString()
  }
  categories.push(newCategory)
  dbStorage.setItem(CATEGORIES_DB_NAME, categories)
  return newCategory
}

const updateCategory = (id, updates) => {
  const categories = getAllCategories()
  const index = categories.findIndex((c) => c.id === id)
  if (index === -1) return null
  categories[index] = { ...categories[index], ...updates }
  dbStorage.setItem(CATEGORIES_DB_NAME, categories)
  return categories[index]
}

const deleteCategory = (id) => {
  const categories = getAllCategories()
  dbStorage.setItem(
    CATEGORIES_DB_NAME,
    categories.filter((c) => c.id !== id)
  )
  const todos = getAllTodos()
  dbStorage.setItem(
    TODO_DB_NAME,
    todos.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t))
  )
}

// ========== AI Agent Tools ==========

if (window.utools.registerTool) {
  // 查询待办事项（支持按时间、分类、完成状态筛选）
  window.utools.registerTool('query_todos', ({ status, categoryId, startDate, endDate } = {}) => {
    console.log('query_todos', status, categoryId, startDate, endDate)
    let todos = getAllTodos()
    const categories = getAllCategories()
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

    if (status === 'completed') {
      todos = todos.filter((t) => t.completed)
    } else if (status === 'pending') {
      todos = todos.filter((t) => !t.completed)
    }

    if (categoryId) {
      todos = todos.filter((t) => t.categoryId === categoryId)
    }

    if (startDate) {
      const start = new Date(startDate).getTime()
      todos = todos.filter((t) => t.dueDate && new Date(t.dueDate).getTime() >= start)
    }

    if (endDate) {
      const end = new Date(endDate).getTime()
      todos = todos.filter((t) => t.dueDate && new Date(t.dueDate).getTime() <= end)
    }

    return todos.map((t) => ({
      ...t,
      categoryName: t.categoryId ? categoryMap[t.categoryId] || null : null
    }))
  })

  // 添加待办事项
  window.utools.registerTool('add_todo', (params) => {
    return addTodo(params)
  })

  // 更新待办事项
  window.utools.registerTool('update_todo', ({ id, ...updates }) => {
    const result = updateTodo(id, updates)
    if (!result) return { error: `待办事项 ${id} 不存在` }
    return result
  })

  // 删除待办事项
  window.utools.registerTool('delete_todo', ({ id }) => {
    deleteTodo(id)
    return { success: true }
  })

  // 切换完成状态
  window.utools.registerTool('toggle_todo_status', ({ id }) => {
    const result = toggleTodoStatus(id)
    if (!result) return { error: `待办事项 ${id} 不存在` }
    return result
  })

  // 查询所有分类
  window.utools.registerTool('query_categories', () => {
    return getAllCategories()
  })

  // 添加分类
  window.utools.registerTool('add_category', (params) => {
    return addCategory(params)
  })

  // 更新分类
  window.utools.registerTool('update_category', ({ id, ...updates }) => {
    const result = updateCategory(id, updates)
    if (!result) return { error: `分类 ${id} 不存在` }
    return result
  })

  // 删除分类
  window.utools.registerTool('delete_category', ({ id }) => {
    deleteCategory(id)
    return { success: true }
  })
}

// 初始化
initDB()

// 导出供前端使用
window.todoServices = {
  addTodo,
  getAllTodos,
  updateTodo,
  deleteTodo,
  toggleTodoStatus,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory
}
