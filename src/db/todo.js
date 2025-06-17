import { db } from './index'

const TODO_DB_NAME = 'todos'
const CATEGORIES_DB_NAME = 'categories'
const RECURRING_TASKS_DB_NAME = 'recurring_tasks'

// 初始化数据库
export const initTodoDB = () => {
  if (!db.get(TODO_DB_NAME)) {
    db.set(TODO_DB_NAME, [])
  }
  if (!db.get(CATEGORIES_DB_NAME)) {
    db.set(CATEGORIES_DB_NAME, [])
  }
  if (!db.get(RECURRING_TASKS_DB_NAME)) {
    db.set(RECURRING_TASKS_DB_NAME, [])
  }
}

// 获取所有待办事项
export const getAllTodos = () => {
  return db.get(TODO_DB_NAME) || []
}

// 添加待办事项
export const addTodo = (todo) => {
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
    starred: todo.starred || false,
    recurringTaskId: todo.recurringTaskId || null,
    isRecurringInstance: todo.isRecurringInstance || false,
    instanceDate: todo.instanceDate || null,
    generatedAt: todo.generatedAt || null
  }
  todos.push(newTodo)
  db.set(TODO_DB_NAME, todos)
  return newTodo
}

// 更新待办事项
export const updateTodo = (id, updates) => {
  const todos = getAllTodos()
  const index = todos.findIndex(todo => todo.id === id)
  if (index !== -1) {
    todos[index] = {
      ...todos[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    db.set(TODO_DB_NAME, todos)
    return todos[index]
  }
  return null
}

// 删除待办事项
export const deleteTodo = (id) => {
  const todos = getAllTodos()
  const filteredTodos = todos.filter(todo => todo.id !== id)
  db.set(TODO_DB_NAME, filteredTodos)
}

// 切换待办事项状态
export const toggleTodoStatus = (id) => {
  const todos = getAllTodos()
  const index = todos.findIndex(todo => todo.id === id)
  if (index !== -1) {
    todos[index].completed = !todos[index].completed
    todos[index].updatedAt = new Date().toISOString()
    if (todos[index].completed) {
      todos[index].completedAt = new Date().toISOString()
    } else {
      todos[index].completedAt = null
    }
    db.set(TODO_DB_NAME, todos)
    return todos[index]
  }
  return null
}

// 获取所有分类
export const getAllCategories = () => {
  return db.get(CATEGORIES_DB_NAME) || []
}

// 添加分类
export const addCategory = (category) => {
  const categories = getAllCategories()
  const newCategory = {
    id: Date.now().toString(),
    name: category.name,
    icon: category.icon,
    color: category.color || "default",
    createdAt: new Date().toISOString()
  }
  categories.push(newCategory)
  db.set(CATEGORIES_DB_NAME, categories)
  return newCategory
}

// 按分类获取待办事项
export const getTodosByCategory = (categoryId) => {
  const todos = getAllTodos()
  return todos.filter(todo => todo.categoryId === categoryId)
}

// 删除分类
export const deleteCategory = (categoryId) => {
  // 删除分类
  const categories = getAllCategories()
  const filteredCategories = categories.filter(cat => cat.id !== categoryId)
  db.set(CATEGORIES_DB_NAME, filteredCategories)

  // 将该分类下的待办事项分类设为 null
  const todos = getAllTodos()
  const updatedTodos = todos.map(todo => {
    if (todo.categoryId === categoryId) {
      return { ...todo, categoryId: null }
    }
    return todo
  })
  db.set(TODO_DB_NAME, updatedTodos)
}

// ==================== 循环任务模板相关操作 ====================

// 获取所有循环任务模板
export const getAllRecurringTasks = () => {
  return db.get(RECURRING_TASKS_DB_NAME) || []
}

// 添加循环任务模板
export const addRecurringTask = (recurringTask) => {
  const recurringTasks = getAllRecurringTasks()
  const newRecurringTask = {
    id: Date.now().toString(),
    title: recurringTask.title,
    description: recurringTask.description || '',
    categoryId: recurringTask.categoryId || null,
    starred: recurringTask.starred || false,
    
    // 循环配置
    recurringType: recurringTask.recurringType, // 'daily' | 'weekly' | 'monthly' | 'custom'
    recurringConfig: recurringTask.recurringConfig || {},
    
    // 结束条件
    repeatEndType: recurringTask.repeatEndType || 'never', // 'never' | 'until' | 'count'
    repeatUntil: recurringTask.repeatUntil || null,
    repeatCount: recurringTask.repeatCount || null,
    
    // 提醒设置
    reminderEnabled: recurringTask.reminderEnabled || false,
    reminderOffset: recurringTask.reminderOffset || 0, // 提前多少分钟提醒
    
    // 元数据
    startDate: recurringTask.startDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: recurringTask.isActive !== false // 默认启用
  }
  
  recurringTasks.push(newRecurringTask)
  db.set(RECURRING_TASKS_DB_NAME, recurringTasks)
  return newRecurringTask
}

// 更新循环任务模板
export const updateRecurringTask = (id, updates) => {
  const recurringTasks = getAllRecurringTasks()
  const index = recurringTasks.findIndex(task => task.id === id)
  if (index !== -1) {
    recurringTasks[index] = {
      ...recurringTasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    db.set(RECURRING_TASKS_DB_NAME, recurringTasks)
    return recurringTasks[index]
  }
  return null
}

// 删除循环任务模板
export const deleteRecurringTask = (id) => {
  const recurringTasks = getAllRecurringTasks()
  const filteredTasks = recurringTasks.filter(task => task.id !== id)
  db.set(RECURRING_TASKS_DB_NAME, filteredTasks)
  
  // 注意：已生成的实例任务不会被删除，保持历史记录
}

// 获取单个循环任务模板
export const getRecurringTask = (id) => {
  const recurringTasks = getAllRecurringTasks()
  return recurringTasks.find(task => task.id === id)
}

// 切换循环任务模板的启用状态
export const toggleRecurringTaskStatus = (id) => {
  const recurringTasks = getAllRecurringTasks()
  const index = recurringTasks.findIndex(task => task.id === id)
  if (index !== -1) {
    recurringTasks[index].isActive = !recurringTasks[index].isActive
    recurringTasks[index].updatedAt = new Date().toISOString()
    db.set(RECURRING_TASKS_DB_NAME, recurringTasks)
    return recurringTasks[index]
  }
  return null
}

// ==================== 循环任务实例相关操作 ====================

// 根据循环任务ID和实例日期查找任务
export const getTaskByRecurringInstance = (recurringTaskId, instanceDate) => {
  const todos = getAllTodos()
  const targetDateStr = new Date(instanceDate).toISOString().split('T')[0] // 只比较日期部分
  
  return todos.find(todo => 
    todo.recurringTaskId === recurringTaskId && 
    todo.isRecurringInstance === true &&
    todo.instanceDate && 
    new Date(todo.instanceDate).toISOString().split('T')[0] === targetDateStr
  )
}

// 获取某个循环任务的所有已生成实例
export const getRecurringTaskInstances = (recurringTaskId) => {
  const todos = getAllTodos()
  return todos.filter(todo => 
    todo.recurringTaskId === recurringTaskId && 
    todo.isRecurringInstance === true
  )
}

// 处理循环任务实例状态变更
export const handleRecurringInstanceStatusChange = (recurringTaskId, instanceDate, updates) => {
  const existingTask = getTaskByRecurringInstance(recurringTaskId, instanceDate)
  
  if (existingTask) {
    // 更新现有记录
    return updateTodo(existingTask.id, updates)
  } else {
    // 创建新的物理记录
    const template = getRecurringTask(recurringTaskId)
    if (!template) return null
    
    const newTask = {
      title: template.title,
      description: template.description,
      categoryId: template.categoryId,
      starred: template.starred,
      dueDate: instanceDate,
      reminderTime: null, // 根据模板计算
      recurringTaskId: recurringTaskId,
      isRecurringInstance: true,
      instanceDate: new Date(instanceDate).toISOString(),
      generatedAt: new Date().toISOString(),
      ...updates
    }
    return addTodo(newTask)
  }
} 