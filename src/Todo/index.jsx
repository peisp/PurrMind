import React, { useState, useEffect, useCallback } from 'react'
import './index.css'

const Index = ({ enterAction }) => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')

  // 格式化日期
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // 对待办事项进行排序
  const sortTodos = (items) => {
    return [...items].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  }

  // 保存待办事项到数据库
  const saveTodos = useCallback((updatedTodos) => {
    const sortedTodos = sortTodos(updatedTodos)
    window.utools.dbStorage.setItem('todos', sortedTodos)
    setTodos(sortedTodos)
  }, [])

  // 显示通知
  const showNotification = (content, type = 'add') => {
    const action = type === 'add' ? '添加' : type === 'delete' ? '删除' : '更新'
    window.utools.showNotification(`${action}【${content}】成功`)
  }

  // 从数据库加载待办事项
  useEffect(() => {
    const loadTodos = async () => {
      const items = window.utools.dbStorage.getItem('todos') || []
      saveTodos(items)
    }
    loadTodos()
  }, [saveTodos])

  // 处理从 enterAction 添加待办事项
  useEffect(() => {
    if (enterAction?.type === 'over' && enterAction?.payload) {
      const content = enterAction.payload.trim()
      if (content) {
        const newItem = {
          id: Date.now(),
          content,
          completed: false,
          createTime: new Date().toISOString()
        }
        const currentTodos = window.utools.dbStorage.getItem('todos') || []
        saveTodos([...currentTodos, newItem])
        showNotification(content)
      }
    }
  }, [enterAction, saveTodos])

  const addTodo = useCallback(() => {
    if (!newTodo?.trim()) return
    
    const newItem = {
      id: Date.now(),
      content: newTodo.trim(),
      completed: false,
      createTime: new Date().toISOString()
    }
    
    const currentTodos = window.utools.dbStorage.getItem('todos') || []
    saveTodos([...currentTodos, newItem])
    setNewTodo('')
    showNotification(newItem.content)
  }, [newTodo, saveTodos])

  const toggleTodo = useCallback((id) => {
    const currentTodos = window.utools.dbStorage.getItem('todos') || []
    const updatedTodos = currentTodos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
    saveTodos(updatedTodos)
    const toggledTodo = updatedTodos.find(todo => todo.id === id)
    showNotification(toggledTodo.content, 'update')
  }, [saveTodos])

  const deleteTodo = useCallback((id) => {
    const currentTodos = window.utools.dbStorage.getItem('todos') || []
    const todoToDelete = currentTodos.find(todo => todo.id === id)
    const updatedTodos = currentTodos.filter(todo => todo.id !== id)
    saveTodos(updatedTodos)
    showNotification(todoToDelete.content, 'delete')
  }, [saveTodos])

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }, [addTodo])

  return (
    <div className="todo-container">
      <h1>待办事项</h1>
      <div className="todo-input">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="输入新的待办事项..."
          onKeyPress={handleKeyPress}
        />
        <button onClick={addTodo}>添加</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-item-left">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span className="todo-content">{todo.content}</span>
            </div>
            <div className="todo-item-right">
              <span className="todo-time">{formatDate(todo.createTime)}</span>
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="delete-btn"
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Index