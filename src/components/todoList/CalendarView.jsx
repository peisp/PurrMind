import {
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  isSameMonth
} from 'date-fns'
import { cn } from '@/lib/utils'

export function CalendarView({ 
  todos, 
  currentDate,
  viewMode, // 'week' 或 'month'
  onToggleStatus
}) {
  // 根据视图模式计算日期范围
  let start, end
  if (viewMode === 'month') {
    const monthStart = startOfMonth(currentDate)
    start = startOfWeek(monthStart, { weekStartsOn: 0 }) // 0表示周日
    end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
  } else { // 周视图
    start = startOfWeek(currentDate, { weekStartsOn: 0 })
    end = endOfWeek(currentDate, { weekStartsOn: 0 })
  }
  const days = eachDayOfInterval({ start, end })

  const renderDateCell = (day) => {
    const isCurrentMonth = isSameMonth(day, currentDate)
    const dayTodos = todos.filter(todo => {
      const todoDate = new Date(todo.dueDate || todo.createdAt)
      return isSameDay(todoDate, day)
    })
    const isToday = isSameDay(day, new Date())
    
    return (
      <div className="relative h-full flex flex-col min-h-0">
        {/* 当天日期使用圆形背景 */}
        <div className="flex-shrink-0">
          <span className={cn(
            "inline-flex items-center justify-center w-6 h-4 text-xs",
            isToday 
              ? "bg-blue-500 text-white rounded-full"
              : isCurrentMonth ? "text-foreground" : "text-muted-foreground opacity-50"
          )}>
            {format(day, 'd')}
          </span>
        </div>
        
        {/* 只显示当前月的待办事项 */}
        {isCurrentMonth && dayTodos.length > 0 && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-1">
              {dayTodos.map(todo => (
                <div 
                  key={todo.id}
                  className={cn(
                    "text-xs px-1 py-1 rounded flex items-center gap-1.5 group cursor-pointer",
                    todo.completedAt 
                      ? "bg-gray-200 text-gray-500" 
                      : "bg-green-100 text-green-800 hover:bg-green-150"
                  )}
                  onClick={(e) => onToggleStatus(todo.id)}
                >
                  {/* Checkbox按钮 - 独立的点击区域 */}
                  <button 
                    type="button"
                    className={cn(
                      "flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors",
                      "hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500",
                      todo.completedAt 
                        ? "bg-green-500 border-green-600 hover:bg-green-600" 
                        : "bg-white border-gray-400 hover:border-gray-500"
                    )}
                    onClick={(e) => onToggleStatus(todo.id)}
                    onMouseDown={(e) => onToggleStatus(todo.id)}
                    aria-label={todo.completedAt ? "标记为未完成" : "标记为已完成"}
                    aria-checked={!!todo.completedAt}
                    role="checkbox"
                    tabIndex={0}
                  >
                    {todo.completedAt && (
                      <svg 
                        className="w-2.5 h-2.5" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Todo标题 */}
                  <span 
                    className={cn(
                      "flex-1 truncate select-none",
                      todo.completedAt && "line-through"
                    )}
                    title={todo.title} // 添加hover提示完整标题
                  >
                    {todo.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 星期标题行 */}
      <div className="grid grid-cols-7 text-center text-sm font-medium flex-shrink-0">
        {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
          <div 
            key={day} 
            className={cn(
              "border-r border-b border-gray-200",
              (index === 0 || index === 6) && "text-gray-500 bg-gray-100"  // 周六日灰色+浅灰背景
            )}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 日期网格 */}
      <div className="grid grid-cols-7 auto-rows-fr flex-1 min-h-0 
        [&>:nth-last-child(-n+7)]:border-b-0">
        {days.map((day, index) => {
          const dayOfWeek = day.getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
          const isCurrentMonth = isSameMonth(day, currentDate)
          
          return (
            <div
              key={day.toString()}
              className={cn(
                "p-1 transition-colors border-r border-b border-gray-200 flex flex-col min-h-0",
                isWeekend && "bg-gray-50", // 周末浅灰色背景
                "hover:bg-gray-100",
                !isCurrentMonth && "opacity-50" // 非当前月日期半透明
              )}
            >
              {renderDateCell(day)}
            </div>
          )
        })}
      </div>
    </div>
  )
}