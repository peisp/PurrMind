import { cn } from '@/lib/utils.js'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import * as Icons from 'lucide-react'
import { TodoList } from '@/components/todoList/todo-list.jsx'
import { TodoForm } from '@/components/todoList/todo-form.jsx'
import { CalendarHeader } from '@/components/todoList/CalendarHeader'
import { useState } from 'react'
import { addMonths, subMonths, addWeeks, subWeeks } from 'date-fns'

export function MainContent ({
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
  setShowCompleted,
  viewMode,
  setViewMode
}) {
  const Icon = Icons[currentIcon.icon] || Icons.ListIcon
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date())
  const [calendarViewMode, setCalendarViewMode] = useState('week') // 默认显示周视图

  const handleViewChange = (view) => {
    setCalendarViewMode(view)
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

  const handlePrev = () => {
    if (calendarViewMode === 'month') {
      setCalendarCurrentDate(subMonths(calendarCurrentDate, 1))
    } else {
      setCalendarCurrentDate(subWeeks(calendarCurrentDate, 1))
    }
  }

  const handleNext = () => {
    if (calendarViewMode === 'month') {
      setCalendarCurrentDate(addMonths(calendarCurrentDate, 1))
    } else {
      setCalendarCurrentDate(addWeeks(calendarCurrentDate, 1))
    }
  }

  const handleToday = () => setCalendarCurrentDate(new Date())

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-1px)] min-w-0 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <div className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', getColorClass(currentIcon.color))}/>
              <h1 className="text-lg font-semibold text-primary">{currentLabel}</h1>
            </div>
          </div>
          <div className="px-3 flex gap-1">
            {/* 日历视图时显示日历导航 */}
            {viewMode === 'calendar' && (
              <CalendarHeader
                currentDate={calendarCurrentDate}
                onPrevMonth={handlePrev}
                onNextMonth={handleNext}
                onToday={handleToday}
                currentView={calendarViewMode}
                onViewChange={handleViewChange}
              />
            )}
            {/* 固定Tooltip位置容器 */}
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8',
                      showCompleted && 'text-primary',
                      currentFilter === 'completed' && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => {
                      if (currentFilter !== 'completed') {
                        setShowCompleted(!showCompleted)
                      }
                    }}
                    disabled={currentFilter === 'completed'}
                  >
                    <Icons.CheckCircle2 className="h-4 w-4"/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  {currentFilter === 'completed'
                    ? '已完成过滤器下必须显示已完成事项'
                    : showCompleted
                      ? '隐藏已完成事项'
                      : '显示已完成事项'
                  }
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      console.log('Current viewMode:', viewMode)
                      if (viewMode === 'timeline') {
                        setViewMode('calendar')
                        setCalendarViewMode('week') // 默认显示周视图
                      } else {
                        setViewMode('timeline')
                      }
                    }}
                  >
                    {viewMode === 'timeline' ? (
                      <Icons.Calendar className="h-4 w-4"/>
                    ) : (
                      <Icons.Clock className="h-4 w-4"/>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  {viewMode === 'timeline' ? '切换到日历视图' : '切换到时间轴视图'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <TodoList
              todos={todos}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              onToggleStatus={handleToggleStatus}
              categories={categories}
              viewMode={viewMode}
              calendarCurrentDate={calendarCurrentDate}
              calendarViewMode={calendarViewMode}
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
    </TooltipProvider>
  )
}
