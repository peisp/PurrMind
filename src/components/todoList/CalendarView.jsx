import { useState } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  isSameMonth,
  addWeeks,
  subWeeks
} from 'date-fns'
import { cn } from '@/lib/utils'

export function CalendarView({ 
  todos, 
  onEdit, 
  currentDate,
  viewMode // 'week' 或 'month'
}) {
  const [selectedDate, setSelectedDate] = useState(null)

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
    
    // 计算单元格高度（减去日期标签高度）
    const cellHeight = `calc(100% - 1rem)`
    
    return (
      <div className="relative h-full flex flex-col pt-1">
        {/* 当天日期使用圆形背景 */}
        <span className={cn(
          "inline-flex items-center justify-center w-6 h-4 text-xs flex-none",
          isToday 
            ? "bg-blue-500 text-white rounded-full"
            : isCurrentMonth ? "text-foreground" : "text-muted-foreground opacity-50"
        )}>
          {format(day, 'd')}
        </span>
        
        {/* 只显示当前月的待办事项 */}
        {isCurrentMonth && (
          <ul 
            className="flex-1 overflow-y-auto space-y-1 pt-1"
            style={{ maxHeight: cellHeight }}
          >
            {dayTodos.map(todo => (
              <li 
                key={todo.id}
                className={cn(
                  "text-xs truncate px-1 py-0.5 rounded",
                  todo.completedAt 
                    ? "bg-gray-200 text-gray-500 line-through" 
                    : "bg-blue-100 text-blue-800"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(todo)
                }}
              >
                {todo.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
      <div className="h-full flex flex-col">
        {/* 星期标题行 */}
        <div className="grid grid-cols-7 text-center text-sm font-medium">
          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
            <div 
              key={day} 
              className={cn(
                "border-r border-b border-gray-200 py-1",
                (index === 0 || index === 6) && "text-gray-500 bg-gray-100"  // 周六日红色+深灰背景
              )}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 日期网格 - 添加自定义选择器移除最后一行下边框 */}
        <div className="grid grid-cols-7 auto-rows-fr overflow-hidden flex-1 
          [&>:nth-last-child(-n+7)]:border-b-0">
          {days.map((day, index) => {
            const dayOfWeek = day.getDay()
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
            const isCurrentMonth = isSameMonth(day, currentDate)
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "cursor-pointer p-0.5 transition-colors border-r border-b border-gray-200 flex flex-col",
                  isWeekend && "bg-gray-50", // 周末深灰色背景
                  selectedDate && isSameDay(day, selectedDate) 
                    ? "bg-blue-100 border border-blue-300" 
                    : "hover:bg-gray-100",
                  !isCurrentMonth && "opacity-50" // 非当前月日期半透明
                )}
                onClick={() => setSelectedDate(day)}
              >
                {renderDateCell(day)}
              </div>
            )
          })}
        </div>
      </div>
  )
}
