import { db } from './index'

const TODO_DB_NAME = 'todos'
const CATEGORIES_DB_NAME = 'categories'

// 初始化数据库
export const initTodoDB = () => {
  if (!db.get(TODO_DB_NAME)) {
    db.set(TODO_DB_NAME, [])
  }
  if (!db.get(CATEGORIES_DB_NAME)) {
    db.set(CATEGORIES_DB_NAME, [])
  }
}

// 获取所有待办事项
export const getAllTodos = () => {
  return db.get(TODO_DB_NAME) || []
}

const safeDate = v => {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : v
}

// 添加待办事项
export const addTodo = todo => {
  const todos = getAllTodos()
  const newTodo = {
    id: Date.now().toString(),
    title: todo.title,
    description: todo.description || '',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: todo.categoryId || null,
    dueDate: safeDate(todo.dueDate),
    reminderTime: safeDate(todo.reminderTime),
    starred: todo.starred || false,
    recurrence: todo.recurrence || null
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
export const deleteTodo = id => {
  const todos = getAllTodos()
  const filteredTodos = todos.filter(todo => todo.id !== id)
  db.set(TODO_DB_NAME, filteredTodos)
}

// 切换待办事项状态
export const toggleTodoStatus = id => {
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
export const addCategory = category => {
  const categories = getAllCategories()
  const newCategory = {
    id: Date.now().toString(),
    name: category.name,
    icon: category.icon,
    color: category.color || 'default',
    createdAt: new Date().toISOString()
  }
  categories.push(newCategory)
  db.set(CATEGORIES_DB_NAME, categories)
  return newCategory
}

// 更新分类
export const updateCategory = (id, updates) => {
  const categories = getAllCategories()
  const index = categories.findIndex(cat => cat.id === id)
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates }
    db.set(CATEGORIES_DB_NAME, categories)
    return categories[index]
  }
  return null
}

// 按分类获取待办事项
export const getTodosByCategory = categoryId => {
  const todos = getAllTodos()
  return todos.filter(todo => todo.categoryId === categoryId)
}

// 删除分类
export const deleteCategory = categoryId => {
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
