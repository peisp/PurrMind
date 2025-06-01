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
import { Checkbox } from '@/components/ui/checkbox'

export function CalendarView ({
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
        {/* 当天日期使用圆形背景 - 绝对定位居中 */}
        {/*isToday*/}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <span className={cn(
            'inline-flex items-center justify-center text-5xl font-black text-muted-foreground opacity-20',
            // isCurrentMonth ? 'opacity-30' : 'opacity-20',
            isToday
              ? 'text-primary rounded-full opacity-60' : ''
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
                    'text-x rounded px-1 pb-1 flex items-center gap-1 group cursor-pointer hover:bg-accent/30',
                    todo.completedAt
                      ? 'text-muted-foreground'
                      : 'text-foreground'
                  )}
                  onClick={(e) => onToggleStatus(todo.id)}
                  title={todo.title} // 添加hover提示完整标题
                >
                  <Checkbox
                    checked={!!todo.completedAt}
                    onCheckedChange={() => onToggleStatus(todo.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 h-4 w-4"
                  />

                  {/* Todo标题 */}
                  <span
                    className={cn(
                      'flex-1 truncate select-none',
                      todo.completedAt && 'line-through'
                    )}
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
            className="border-r border-b border-gray-200"
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
                'p-1 transition-colors border-r border-b border-gray-200 flex flex-col min-h-0',
                isWeekend && 'bg-gray-50', // 周末浅灰色背景
                'hover:bg-gray-100',
                !isCurrentMonth && 'opacity-50' // 非当前月日期半透明
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
