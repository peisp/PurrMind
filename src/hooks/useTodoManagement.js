import { useEffect, useReducer, useMemo, useCallback } from 'react'
import {
  initTodoDB,
  getAllTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoStatus,
  getAllCategories
} from '@/db/todo.js'
import { advanceRecurrence, getRecurrenceLabel } from '@/lib/recurrence'

// 状态管理用 reducer，避免多个useState
const initialState = {
  todos: [],
  categories: [],
  currentFilter: 'all',
  currentCategory: null,
  currentLabel: '全部',
  currentIcon: { icon: 'ListIcon', color: 'default' },
  defaultDueDate: null,
  showCompleted: false
}

function todoReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        todos: action.payload.todos || state.todos,
        categories: action.payload.categories || state.categories
      }

    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, ...action.payload.updates }
            : todo
        )
      }

    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload]
      }

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      }

    case 'SET_FILTER': {
      const { filter, label, icon, color, dueDate } = action.payload
      return {
        ...state,
        currentFilter: filter,
        currentCategory: null,
        currentLabel: label,
        currentIcon: { icon, color },
        defaultDueDate: dueDate,
        showCompleted:
          filter === 'completed'
            ? true
            : state.currentFilter === 'completed' && filter !== 'completed'
              ? false
              : state.showCompleted
      }
    }

    case 'SET_CATEGORY': {
      const categoryData = state.categories.find(
        cat => cat.id === action.payload.category
      )
      return {
        ...state,
        currentCategory: action.payload.category,
        currentFilter: null,
        currentLabel: action.payload.label,
        showCompleted: false,
        currentIcon: categoryData
          ? { icon: categoryData.icon, color: categoryData.color }
          : state.currentIcon
      }
    }

    case 'TOGGLE_COMPLETED':
      return {
        ...state,
        showCompleted: action.payload
      }

    default:
      return state
  }
}

export function useTodoManagement(enterAction) {
  const [state, dispatch] = useReducer(todoReducer, initialState)

  // 数据加载 - 只在需要时调用，不在useEffect中同步状态
  const loadData = useCallback(() => {
    const todos = getAllTodos()
    const categories = getAllCategories()
    dispatch({ type: 'SET_DATA', payload: { todos, categories } })
  }, [])

  // 初始化 - 只运行一次
  useEffect(() => {
    initTodoDB()
    loadData()

    // 处理enterAction
    if (enterAction?.type === 'over' && enterAction?.payload) {
      const newTodo = addTodo({
        title: enterAction.payload.trim(),
        description: '',
        dueDate: null,
        completed: false,
        starred: false,
        categoryId: null
      })
      dispatch({ type: 'ADD_TODO', payload: newTodo })
    }
  }, [loadData, enterAction])

  // 外部事件监听 - 避免在useEffect中同步状态
  useEffect(() => {
    const handleStorageChange = e => {
      if (e.key === 'todos' || e.key === 'categories') {
        loadData()
      }
    }

    const handleTodoUpdated = () => {
      loadData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('todo-updated', handleTodoUpdated)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('todo-updated', handleTodoUpdated)
    }
  }, [loadData])

  // 操作函数 - 直接更新状态，减少重复的数据获取
  const handleAddTodo = useCallback(todo => {
    const newTodo = addTodo(todo)
    dispatch({ type: 'ADD_TODO', payload: newTodo })
    window.dispatchEvent(new Event('todo-updated'))
  }, [])

  const handleUpdateTodo = useCallback((id, updates) => {
    const updatedTodo = updateTodo(id, updates)
    if (updatedTodo) {
      dispatch({ type: 'UPDATE_TODO', payload: { id, updates } })
      window.dispatchEvent(new Event('todo-updated'))
    }
  }, [])

  const handleDeleteTodo = useCallback(id => {
    deleteTodo(id)
    dispatch({ type: 'DELETE_TODO', payload: { id } })
    window.dispatchEvent(new Event('todo-updated'))
  }, [])

  const handleToggleStatus = useCallback(
    (id, e) => {
      if (e) e.stopPropagation()

      // 查找当前 todo（从 state 中获取完整数据）
      const currentTodo = state.todos.find(t => t.id === id)

      // 如果是循环任务且当前未完成（即正在勾选完成），自动推进到下一个周期
      if (currentTodo?.recurrence && !currentTodo.completed) {
        const nextDates = advanceRecurrence(currentTodo)
        if (nextDates) {
          const updates = {
            ...nextDates,
            completed: false,
            completedAt: null
          }
          const result = updateTodo(id, updates)
          if (result) {
            dispatch({ type: 'UPDATE_TODO', payload: { id, updates } })
            window.dispatchEvent(new Event('todo-updated'))

            // 通知用户已推进
            const label = getRecurrenceLabel(currentTodo.recurrence)
            if (nextDates.reminderTime && window.utools?.showNotification) {
              const nextDate = new Date(nextDates.reminderTime)
              const dateStr = `${nextDate.getMonth() + 1}月${nextDate.getDate()}日`
              window.utools.showNotification(
                `${label}任务已推进到${dateStr}`,
                'index'
              )
            }
          }
          return
        }
      }

      // 非循环任务，正常切换完成状态
      const updatedTodo = toggleTodoStatus(id)
      if (updatedTodo) {
        dispatch({
          type: 'UPDATE_TODO',
          payload: {
            id,
            updates: {
              completed: updatedTodo.completed,
              completedAt: updatedTodo.completedAt
            }
          }
        })
        window.dispatchEvent(new Event('todo-updated'))
      }
    },
    [state.todos]
  )

  const handleFilterChange = useCallback(
    (filter, label, icon, color, dueDate) => {
      dispatch({
        type: 'SET_FILTER',
        payload: { filter, label, icon, color, dueDate }
      })
    },
    []
  )

  const handleCategoryChange = useCallback(
    (category, label) => {
      if (category === state.currentCategory) return
      dispatch({
        type: 'SET_CATEGORY',
        payload: { category, label }
      })
    },
    [state.currentCategory]
  )

  const setShowCompleted = useCallback(show => {
    dispatch({ type: 'TOGGLE_COMPLETED', payload: show })
  }, [])

  // 过滤逻辑使用useMemo优化
  const filteredTodos = useMemo(() => {
    return state.todos.filter(todo => {
      if (state.currentCategory !== null) {
        return (
          (state.showCompleted || !todo.completed) &&
          todo.categoryId === state.currentCategory
        )
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todoDate = new Date(todo.dueDate)
      todoDate.setHours(0, 0, 0, 0)

      switch (state.currentFilter) {
        case 'today':
          return (
            (state.showCompleted || !todo.completed) &&
            todoDate.getTime() === today.getTime()
          )
        case 'planned':
          return (
            (state.showCompleted || !todo.completed) &&
            todoDate.getTime() > today.getTime()
          )
        case 'starred':
          return (state.showCompleted || !todo.completed) && todo.starred
        case 'completed':
          return todo.completed
        case 'all':
          return state.showCompleted || !todo.completed
        default:
          return state.showCompleted || !todo.completed
      }
    })
  }, [
    state.todos,
    state.currentCategory,
    state.currentFilter,
    state.showCompleted
  ])

  return {
    todos: filteredTodos,
    categories: state.categories,
    currentLabel: state.currentLabel,
    currentIcon: state.currentIcon,
    currentCategory: state.currentCategory,
    showCompleted: state.showCompleted,
    currentFilter: state.currentFilter,
    defaultDueDate: state.defaultDueDate,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleToggleStatus,
    handleFilterChange,
    handleCategoryChange,
    setShowCompleted
  }
}
