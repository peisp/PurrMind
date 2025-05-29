import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  isSameMonth
} from 'date-fns'
import { cn } from '@/lib/utils'

export function CalendarView({ todos, onToggleStatus, onStar, onEdit, getCategoryName, categories }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  
  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

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
          <ul className="mt-1 space-y-1">
            {dayTodos.slice(0, 3).map(todo => (
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
      {/* 顶部导航栏 */}
      <div className="px-3 flex justify-between items-center border-b">
        
        <span className="text-lg font-medium">
          {format(currentDate, 'yyyy年MM月')}
        </span>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleToday}>
            今天
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* 星期标题行 */}
      <div className="grid grid-cols-7 text-center text-sm font-medium">
        {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
          <div 
            key={day} 
            className={cn(
              "border-r border-b border-gray-200",
              (index === 0 || index === 6) && "text-gray-500 bg-gray-100"  // 周六日红色+深灰背景
              // index === 6 && "text-blue-500 bg-gray-100"   // 周六蓝色+深灰背景
            )}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 日期网格 */}
      <div className="grid grid-cols-7 auto-rows-fr overflow-hidden flex-1">
        {days.map(day => {
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
                !isCurrentMonth && "opacity-50", // 非当前月日期半透明
                day.getTime() === end.getTime() && "border-b-0" // 最后一行去掉下边框
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
