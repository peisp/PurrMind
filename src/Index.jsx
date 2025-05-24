import { useEffect, useState } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar.jsx'
import { AppSidebar } from '@/components/sidebar/app-sidebar.jsx'
import { initTodoDB, getAllTodos, addTodo, updateTodo, deleteTodo, toggleTodoStatus, getTodosByCategory, getAllCategories } from '@/db/todo.js'
import { TodoList } from '@/components/todoList/todo-list.jsx'
import { TodoForm } from '@/components/todoList/todo-form.jsx'
import { TodoNotification } from '@/components/todoList/todo-notification.jsx'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils.js'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function Index({ enterAction }) {
  const [todos, setTodos] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentLabel, setCurrentLabel] = useState('全部')
  const [currentIcon, setCurrentIcon] = useState({ icon: 'ListIcon', color: 'default' })
  const [categories, setCategories] = useState([])
  const [defaultDueDate, setDefaultDueDate] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

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
    // 处理输入动作
    handleEnterAction()


    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('todo-updated', handleTodoUpdated)
    }
  }, [])

  // 处理输入动作
  const handleEnterAction = () => {
    console.log("handleEnterAction",enterAction)
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
    if (e) {
      e.stopPropagation()
    }
    const updatedTodo = toggleTodoStatus(id)
    if (updatedTodo) {
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
      window.dispatchEvent(new Event('todo-updated'))
    }
  }

  const handleFilterChange = (filter, label, icon, color, dueDate) => {
    // 如果从"已完成"过滤器切换到其他过滤器，重置showCompleted状态
    if (currentFilter === 'completed' && filter !== 'completed') {
      setShowCompleted(false)
    }
    // 如果切换到"已完成"过滤器，强制显示已完成事项
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
    // 切换到分类时，重置showCompleted状态
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
            <div className="px-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        showCompleted && "text-primary",
                        currentFilter === 'completed' && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (currentFilter !== 'completed') {
                          setShowCompleted(!showCompleted)
                        }
                      }}
                      disabled={currentFilter === 'completed'}
                    >
                      <Icons.CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {currentFilter === 'completed' 
                      ? "已完成过滤器下必须显示已完成事项" 
                      : showCompleted 
                        ? "隐藏已完成事项" 
                        : "显示已完成事项"
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              <div className="shrink-0 px-4 pb-2 pt-1">
                <TodoForm 
                  onAdd={handleAddTodo} 
                  defaultCategory={currentCategory}
                  defaultStarred={currentFilter === 'starred'}
                  defaultDueDate={defaultDueDate}
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