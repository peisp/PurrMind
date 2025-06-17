import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { initTodoDB, getAllTodos, addTodo, updateTodo, deleteTodo, toggleTodoStatus, getAllCategories, handleRecurringInstanceStatusChange } from '@/db/todo.js'
import { getAllRecurringInstancesInRange } from '@/db/recurring.js'

export function useTodoManagement(enterAction) {
  const [todos, setTodos] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentLabel, setCurrentLabel] = useState('全部')
  const [currentIcon, setCurrentIcon] = useState({ icon: 'ListIcon', color: 'default' })
  const [categories, setCategories] = useState([])
  const [defaultDueDate, setDefaultDueDate] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  // 循环任务相关状态
  const [viewRange, setViewRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)), // 一周前
    end: new Date(new Date().setDate(new Date().getDate() + 30))   // 30天后
  })

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

  // 监听视图范围变化
  useEffect(() => {
    loadTodos()
  }, [viewRange])

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
    
    // 获取循环任务实例
    const recurringInstances = getAllRecurringInstancesInRange(viewRange.start, viewRange.end)
    
    // 合并普通任务和循环任务实例
    const combinedTodos = [...allTodos, ...recurringInstances]
    
    // 去重（如果循环任务实例已经变成了物理任务，避免重复显示）
    const uniqueTodos = combinedTodos.filter((todo, index, self) => {
      // 对于循环任务实例，如果已存在对应的物理任务，则移除虚拟实例
      if (todo.isVirtual && todo.recurringTaskId) {
        const hasPhysicalInstance = self.some(t => 
          !t.isVirtual && 
          t.recurringTaskId === todo.recurringTaskId && 
          t.instanceDate === todo.instanceDate
        )
        return !hasPhysicalInstance
      }
      return true
    })
    
    setTodos(uniqueTodos)
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
    // 检查是否是循环任务的虚拟实例
    const todo = todos.find(t => t.id === id)
    if (todo && todo.isVirtual && todo.recurringTaskId) {
      // 处理循环任务实例的更新
      const updatedTodo = handleRecurringInstanceStatusChange(
        todo.recurringTaskId, 
        todo.instanceDate, 
        updates
      )
      if (updatedTodo) {
        // 重新加载所有任务来更新UI
        loadTodos()
        window.dispatchEvent(new Event('todo-updated'))
      }
    } else {
      // 处理普通任务
      const updatedTodo = updateTodo(id, updates)
      if (updatedTodo) {
        setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
        window.dispatchEvent(new Event('todo-updated'))
      }
    }
  }

  const handleDeleteTodo = (id) => {
    deleteTodo(id)
    setTodos(todos.filter(todo => todo.id !== id))
    window.dispatchEvent(new Event('todo-updated'))
  }

  const handleToggleStatus = (id, e) => {
    if (e) e.stopPropagation()
    
    // 检查是否是循环任务的虚拟实例
    const todo = todos.find(t => t.id === id)
    if (todo && todo.isVirtual && todo.recurringTaskId) {
      // 处理循环任务实例的状态变更
      const updatedTodo = handleRecurringInstanceStatusChange(
        todo.recurringTaskId, 
        todo.instanceDate, 
        { completed: !todo.completed }
      )
      if (updatedTodo) {
        // 重新加载所有任务来更新UI
        loadTodos()
        window.dispatchEvent(new Event('todo-updated'))
      }
    } else {
      // 处理普通任务
      const updatedTodo = toggleTodoStatus(id)
      if (updatedTodo) {
        setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
        window.dispatchEvent(new Event('todo-updated'))
      }
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

  // 更新视图范围的函数
  const updateViewRange = (start, end) => {
    setViewRange({ start, end })
    // 视图范围变更时重新加载任务
    setTimeout(() => loadTodos(), 0)
  }

  return {
    todos: filteredTodos,
    categories,
    currentLabel,
    currentIcon,
    currentCategory,
    showCompleted,
    currentFilter,
    defaultDueDate,
    viewRange,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleToggleStatus,
    handleFilterChange,
    handleCategoryChange,
    setShowCompleted,
    updateViewRange
  }
}
