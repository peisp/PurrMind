import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { initTodoDB, getAllTodos, addTodo, updateTodo, deleteTodo, toggleTodoStatus, getAllCategories } from '@/db/todo.js'

export function useTodoManagement(enterAction) {
  const [todos, setTodos] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentLabel, setCurrentLabel] = useState('全部')
  const [currentIcon, setCurrentIcon] = useState({ icon: 'ListIcon', color: 'default' })
  const [categories, setCategories] = useState([])
  const [defaultDueDate, setDefaultDueDate] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    initTodoDB()
    loadTodos()
    loadCategories()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('todo-updated', handleTodoUpdated)
    handleEnterAction()

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('todo-updated', handleTodoUpdated)
    }
  }, [])

  const handleEnterAction = () => {
    if (enterAction?.type === "over" && enterAction?.payload) {
      addTodo({
        title: enterAction.payload.trim(),
        description: '',
        dueDate: null,
        completed: false,
        starred: false,
        categoryId: null
      })
      loadTodos()
    }
  }

  const handleStorageChange = (e) => {
    if (e.key === 'todos' || e.key === 'categories') {
      loadTodos()
      loadCategories()
    }
  }

  const handleTodoUpdated = () => {
    loadTodos()
    loadCategories()
  }

  const loadTodos = () => {
    const allTodos = getAllTodos()
    setTodos(allTodos)
  }

  const loadCategories = () => {
    const allCategories = getAllCategories()
    setCategories(allCategories)
  }

  const handleAddTodo = (todo) => {
    const newTodo = addTodo(todo)
    setTodos([...todos, newTodo])
    window.dispatchEvent(new Event('todo-updated'))
  }

  const handleUpdateTodo = (id, updates) => {
    const updatedTodo = updateTodo(id, updates)
    if (updatedTodo) {
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
      window.dispatchEvent(new Event('todo-updated'))
    }
  }

  const handleDeleteTodo = (id) => {
    deleteTodo(id)
    setTodos(todos.filter(todo => todo.id !== id))
    window.dispatchEvent(new Event('todo-updated'))
  }

  const handleToggleStatus = (id, e) => {
    if (e) e.stopPropagation()
    const updatedTodo = toggleTodoStatus(id)
    if (updatedTodo) {
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
      window.dispatchEvent(new Event('todo-updated'))
    }
  }

  const handleFilterChange = (filter, label, icon, color, dueDate) => {
    if (currentFilter === 'completed' && filter !== 'completed') {
      setShowCompleted(false)
    }
    if (filter === 'completed') {
      setShowCompleted(true)
    }
    
    setCurrentFilter(filter)
    setCurrentCategory(null)
    setCurrentLabel(label)
    setCurrentIcon({ icon, color })
    setDefaultDueDate(dueDate)
  }

  const handleCategoryChange = (category, label) => {
    if (category === currentCategory) return
    setCurrentCategory(category)
    setCurrentFilter(null)
    setCurrentLabel(label)
    setShowCompleted(false)
    
    const categoryData = categories.find(cat => cat.id === category)
    if (categoryData) {
      setCurrentIcon({ icon: categoryData.icon, color: categoryData.color })
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (currentCategory !== null) {
      return (showCompleted || !todo.completed) && todo.categoryId === currentCategory
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todoDate = new Date(todo.dueDate)
    todoDate.setHours(0, 0, 0, 0)

    switch (currentFilter) {
      case 'today':
        return (showCompleted || !todo.completed) && todoDate.getTime() === today.getTime()
      case 'planned':
        return (showCompleted || !todo.completed) && todoDate.getTime() > today.getTime()
      case 'starred':
        return (showCompleted || !todo.completed) && todo.starred
      case 'completed':
        return todo.completed
      case 'all':
        return showCompleted || !todo.completed
      default:
        return showCompleted || !todo.completed
    }
  })

  return {
    todos: filteredTodos,
    categories,
    currentLabel,
    currentIcon,
    currentCategory,
    showCompleted,
    currentFilter,
    defaultDueDate,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleToggleStatus,
    handleFilterChange,
    handleCategoryChange,
    setShowCompleted
  }
}
