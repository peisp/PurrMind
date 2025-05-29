import { cn } from '@/lib/utils.js'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import * as Icons from 'lucide-react'
import { TodoList } from '@/components/todoList/todo-list.jsx'
import { TodoForm } from '@/components/todoList/todo-form.jsx'

export function MainContent({ 
  todos,
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
  setShowCompleted
}) {
  const Icon = Icons[currentIcon.icon] || Icons.ListIcon

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

  return (
    <div className="flex h-[calc(100vh-1px)] min-w-0 flex-col">
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
        <div className="flex-1 overflow-y-auto px-3">
          <TodoList 
            todos={todos}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            onToggleStatus={handleToggleStatus}
            categories={categories}
          />
        </div>
        {currentFilter !== 'completed' && (
          <div className="shrink-0 px-3 pb-2 pt-1 border-t">
            <TodoForm 
              onAdd={handleAddTodo} 
              defaultCategory={currentCategory}
              defaultStarred={currentFilter === 'starred'}
              defaultDueDate={defaultDueDate}
            />
          </div>
        )}
      </div>
    </div>
  )
}
