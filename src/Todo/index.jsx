import React, { useState, useEffect } from 'react'
import './index.css'

const Index = ({ enterAction }) => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')

  // 从数据库加载待办事项
  useEffect(() => {
    const loadTodos = async () => {
      const items = window.utools.dbStorage.getItem('todos') || []
      setTodos(items)
    }
    loadTodos()
  }, [])

  // 处理从 enterAction 添加待办事项
  useEffect(() => {
    if (enterAction && enterAction.type === 'over' && enterAction.payload) {
      const content = enterAction.payload
      if (content.trim()) {
        const newItem = {
          id: Date.now(),
          content: content,
          completed: false,
          createTime: new Date().toISOString()
        }
        // 直接从数据库获取最新数据
        const currentTodos = window.utools.dbStorage.getItem('todos') || []
        const updatedTodos = [...currentTodos, newItem]
        window.utools.dbStorage.setItem('todos', updatedTodos)
        setTodos(updatedTodos)
      }
    }
  }, [enterAction])

  const addTodo = () => {
    if (!newTodo || typeof newTodo !== 'string' || !newTodo.trim()) return
    const newItem = {
      id: Date.now(),
      content: newTodo.trim(),
      completed: false,
      createTime: new Date().toISOString()
    }
    // 直接从数据库获取最新数据
    const currentTodos = window.utools.dbStorage.getItem('todos') || []
    const updatedTodos = [...currentTodos, newItem]
    window.utools.dbStorage.setItem('todos', updatedTodos)
    setTodos(updatedTodos)
    setNewTodo('')
  }

  const toggleTodo = (id) => {
    // 直接从数据库获取最新数据
    const currentTodos = window.utools.dbStorage.getItem('todos') || []
    const updatedTodos = currentTodos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
    window.utools.dbStorage.setItem('todos', updatedTodos)
    setTodos(updatedTodos)
  }

  const deleteTodo = (id) => {
    // 直接从数据库获取最新数据
    const currentTodos = window.utools.dbStorage.getItem('todos') || []
    const updatedTodos = currentTodos.filter(todo => todo.id !== id)
    window.utools.dbStorage.setItem('todos', updatedTodos)
    setTodos(updatedTodos)
  }

  return (
    <div className="todo-container">
      <h1>待办事项</h1>
      <div className="todo-input">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="输入新的待办事项..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>添加</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className="todo-content">{todo.content}</span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Index