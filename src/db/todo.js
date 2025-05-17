import { db } from './index'

const TODO_DB_NAME = 'todos'

// 初始化数据库
export const initTodoDB = () => {
  if (!db.get(TODO_DB_NAME)) {
    db.set(TODO_DB_NAME, [])
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
    category: todo.category || 'default'
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
    db.set(TODO_DB_NAME, todos)
    return todos[index]
  }
  return null
}

// 按分类获取待办事项
export const getTodosByCategory = (category) => {
  const todos = getAllTodos()
  return todos.filter(todo => todo.category === category)
}

// 获取所有分类
export const getAllCategories = () => {
  const todos = getAllTodos()
  const categories = new Set(todos.map(todo => todo.category))
  return Array.from(categories)
} 