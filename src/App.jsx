import { useEffect, useState } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar.jsx'
import { AppSidebar } from '@/components/app-sidebar.jsx'
import { initTodoDB, getAllTodos, addTodo, updateTodo, deleteTodo, toggleTodoStatus, getTodosByCategory } from '@/db/todo'
import { TodoList } from '@/components/todo-list'
import { TodoForm } from '@/components/todo-form'

export default function App() {
  const [enterAction, setEnterAction] = useState({})
  const [route, setRoute] = useState('')
  const [todos, setTodos] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentCategory, setCurrentCategory] = useState('all')

  useEffect(() => {
    // 初始化数据库
    initTodoDB()
    // 加载待办事项
    loadTodos()

    window.utools.onPluginEnter((action) => {
      setRoute(action.code)
      setEnterAction(action)
    })
    window.utools.onPluginOut((isKill) => {
      setRoute('')
    })
  }, [])

  const loadTodos = () => {
    const allTodos = getAllTodos()
    setTodos(allTodos)
  }

  const handleAddTodo = (todo) => {
    const newTodo = addTodo(todo)
    setTodos([...todos, newTodo])
  }

  const handleUpdateTodo = (id, updates) => {
    const updatedTodo = updateTodo(id, updates)
    if (updatedTodo) {
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
    }
  }

  const handleDeleteTodo = (id) => {
    deleteTodo(id)
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const handleToggleStatus = (id) => {
    const updatedTodo = toggleTodoStatus(id)
    if (updatedTodo) {
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
    }
  }

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter)
  }

  const handleCategoryChange = (category) => {
    setCurrentCategory(category)
  }

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'completed') return todo.completed
    if (currentFilter === 'active') return !todo.completed
    return true
  }).filter(todo => {
    if (currentCategory === 'all') return true
    return todo.category === currentCategory
  })

  if (route === 'index' || route === 'addItem') {
    return (
      <SidebarProvider>
        <div className="grid w-full grid-cols-[auto_1fr]">
          <AppSidebar 
            onFilterChange={handleFilterChange}
            onCategoryChange={handleCategoryChange}
            currentFilter={currentFilter}
            currentCategory={currentCategory}
          />
          <SidebarInset className="flex h-screen min-w-0 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b">
              <div className="flex flex-1 items-center gap-2 px-3">
                <SidebarTrigger />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <TodoForm onAdd={handleAddTodo} />
              <TodoList 
                todos={filteredTodos}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return null
}