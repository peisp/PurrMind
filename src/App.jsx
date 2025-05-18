import { useEffect, useState } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar.jsx'
import { AppSidebar } from '@/components/sidebar/app-sidebar.jsx'
import { initTodoDB, getAllTodos, addTodo, updateTodo, deleteTodo, toggleTodoStatus, getTodosByCategory, getAllCategories } from '@/db/todo'
import { TodoList } from '@/components/todo-list'
import { TodoForm } from '@/components/todo-form'
import { TodoNotification } from '@/components/todo-notification'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'

export default function App() {
  const [enterAction, setEnterAction] = useState({})
  const [route, setRoute] = useState('')
  const [todos, setTodos] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentLabel, setCurrentLabel] = useState('全部')
  const [currentIcon, setCurrentIcon] = useState({ icon: 'ListIcon', color: 'default' })
  const [categories, setCategories] = useState([])

  useEffect(() => {
    // 初始化数据库
    initTodoDB()
    // 加载待办事项
    loadTodos()
    // 加载分类
    loadCategories()

    // 添加事件监听器
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('todo-updated', handleTodoUpdated)

    window.utools.onPluginEnter((action) => {
      setRoute(action.code)
      setEnterAction(action)
    })
    window.utools.onPluginOut((isKill) => {
      setRoute('')
    })

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('todo-updated', handleTodoUpdated)
    }
  }, [])

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

  const getIconComponent = (iconName) => {
    return Icons[iconName] || Icons.ListIcon
  }

  const getColorClass = (color) => {
    switch (color) {
      case 'red':
        return 'text-red-500'
      case 'blue':
        return 'text-blue-500'
      case 'green':
        return 'text-green-500'
      case 'yellow':
        return 'text-yellow-500'
      case 'purple':
        return 'text-purple-500'
      case 'pink':
        return 'text-pink-500'
      default:
        return 'text-gray-500'
    }
  }

  const handleAddTodo = (todo) => {
    const newTodo = addTodo(todo)
    setTodos([...todos, newTodo])
    // 触发自定义事件
    window.dispatchEvent(new Event('todo-updated'))
  }

  const handleUpdateTodo = (id, updates) => {
    const updatedTodo = updateTodo(id, updates)
    if (updatedTodo) {
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
      // 触发自定义事件
      window.dispatchEvent(new Event('todo-updated'))
    }
  }

  const handleDeleteTodo = (id) => {
    deleteTodo(id)
    setTodos(todos.filter(todo => todo.id !== id))
    // 触发自定义事件
    window.dispatchEvent(new Event('todo-updated'))
  }

  const handleToggleStatus = (id, e) => {
    if (e) {
      e.stopPropagation()
    }
    const updatedTodo = toggleTodoStatus(id)
    if (updatedTodo) {
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
      // 触发自定义事件
      window.dispatchEvent(new Event('todo-updated'))
    }
  }

  const handleFilterChange = (filter, label, icon, color) => {
    console.log('Filter changed to:', filter)
    setCurrentFilter(filter)
    setCurrentCategory(null) // 切换到 NavMain 时，清除分类选择
    setCurrentLabel(label) // 更新当前标签
    setCurrentIcon({ icon, color }) // 更新当前图标
  }

  const handleCategoryChange = (category, label) => {
    // 如果点击的是当前选中的分类，不做任何操作
    if (category === currentCategory) return
    setCurrentCategory(category)
    setCurrentFilter(null) // 切换到 NavMyList 时，清除过滤器选择
    setCurrentLabel(label) // 更新当前标签
    
    // 更新图标
    const categoryData = categories.find(cat => cat.id === category)
    if (categoryData) {
      setCurrentIcon({ icon: categoryData.icon, color: categoryData.color })
    }
  }

  const filteredTodos = todos.filter(todo => {
    // 如果选择了分类，只按分类过滤
    if (currentCategory !== null) {
      return todo.categoryId === currentCategory
    }

    // 否则按 NavMain 的过滤器过滤
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todoDate = new Date(todo.dueDate)
    todoDate.setHours(0, 0, 0, 0)

    switch (currentFilter) {
      case 'today':
        return !todo.completed && todoDate.getTime() === today.getTime()
      case 'planned':
        return !todo.completed && todoDate.getTime() > today.getTime()
      case 'starred':
        return !todo.completed && todo.starred
      case 'completed':
        return todo.completed
      case 'all':
        return !todo.completed
      default:
        return true // 当没有选择任何过滤器时，显示所有任务
    }
  })

  if (route === 'index' || route === 'addItem') {
    const Icon = getIconComponent(currentIcon.icon)
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
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', getColorClass(currentIcon.color))} />
                  <h1 className="text-lg font-semibold text-primary">{currentLabel}</h1>
                </div>
              </div>
            </header>
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4">
                <TodoList 
                  todos={filteredTodos}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                  onToggleStatus={handleToggleStatus}
                  categories={categories}
                />
              </div>
              {currentFilter !== 'completed' && (
                <div className="shrink-0 border-t p-4">
                  <TodoForm 
                    onAdd={handleAddTodo} 
                    defaultCategory={currentCategory}
                    defaultStarred={currentFilter === 'starred'}
                  />
                </div>
              )}
            </div>
          </SidebarInset>
        </div>
        <TodoNotification todos={todos} />
      </SidebarProvider>
    )
  }

  return null
}