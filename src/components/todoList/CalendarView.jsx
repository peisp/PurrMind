import { useState } from 'react'
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
  onEdit, 
  currentDate 
}) {
  const [selectedDate, setSelectedDate] = useState(null)

  // 获取日历视图的日期范围（从当月的第一个周日到最后一周的周六）
  const monthStart = startOfMonth(currentDate)
  const start = startOfWeek(monthStart, { weekStartsOn: 0 }) // 0表示周日
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start, end })

  const renderDateCell = (day) => {
    const isCurrentMonth = isSameMonth(day, currentDate)
    const dayTodos = todos.filter(todo => {
      const todoDate = new Date(todo.dueDate || todo.createdAt)
      return isSameDay(todoDate, day) && !todo.completedAt
    })
    const isToday = isSameDay(day, new Date())
    
    return (
      <div className="relative h-full">
        {/* 当天日期使用圆形背景 */}
        <span className={cn(
          "inline-flex items-center justify-center w-6 h-4 text-xs",
          isToday 
            ? "bg-blue-500 text-white rounded-full" 
            : isCurrentMonth ? "text-foreground" : "text-muted-foreground opacity-50"
        )}>
          {format(day, 'd')}
        </span>
        
        {/* 只显示当前月的待办事项 */}
        {isCurrentMonth && (
          <ul className="space-y-1">
            {dayTodos.slice(0, 2).map(todo => (
              <li 
                key={todo.id}
                className="text-xs truncate px-1 py-0.5 rounded bg-blue-100 text-blue-800"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(todo)
                }}
              >
                {todo.title}
              </li>
            ))}
            {dayTodos.length > 3 && (
              <li className="text-xs text-muted-foreground px-1">
                +{dayTodos.length - 3} 更多
              </li>
            )}
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
              "border-r border-b border-gray-200",
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
                "cursor-pointer p-0.5 transition-colors border-r border-b border-gray-200",
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
