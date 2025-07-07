import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Star,
  Calendar,
  FileText,
  AlarmClock,
  CircleCheckBig
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import * as Icons from 'lucide-react'

export function TodoCard({
  todo,
  onToggleStatus,
  onStar,
  onEdit,
  getCategoryName,
  categories
}) {
  const formatDate = date => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const nextMonday = new Date(today)
    nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7 || 7)) // 下一个周一

    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()

    if (isSameDay(d, today)) {
      return `今天 ${format(d, 'HH:mm')}`
    } else if (isSameDay(d, tomorrow)) {
      return `明天 ${format(d, 'HH:mm')}`
    } else if (isSameDay(d, yesterday)) {
      return `昨天 ${format(d, 'HH:mm')}`
    } else if (isSameDay(d, nextMonday)) {
      return `下周一 ${format(d, 'HH:mm')}`
    } else {
      return format(d, 'MM月dd日 HH:mm', { locale: zhCN })
    }
  }

  const getIconComponent = iconName => {
    return Icons[iconName] || Icons.FolderIcon
  }

  const getTimeStatus = time => {
    if (!time || todo.completed) return 'default'
    const now = new Date()
    const target = new Date(time)
    const diff = target - now
    if (diff < 0) return 'red' // 已过期
    if (diff < 2 * 60 * 60 * 1000) return 'yellow' // 2小时内
    return 'default'
  }

  const getColorClass = color => {
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
    <Card
      className='p-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-accent/30'
      onClick={() => onEdit(todo)}
    >
      <div className='flex items-start gap-3'>
        <Checkbox
          checked={todo.completed}
          onCheckedChange={checked => {
            onToggleStatus(todo.id)
          }}
          onClick={e => e.stopPropagation()}
          className='shrink-0 self-center'
        />
        <div className='flex-1 min-w-0'>
          <h3
            className={`text-base font-medium line-clamp-1 ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
          >
            {todo.title}
          </h3>

          <div className='mt-2 flex flex-wrap gap-1.5'>
            {todo.categoryId && (
              <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-xs'>
                {(() => {
                  const category = categories.find(
                    cat => cat.id === todo.categoryId
                  )
                  const Icon = getIconComponent(category?.icon)
                  return (
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5',
                        getColorClass(category?.color)
                      )}
                    />
                  )
                })()}
                <span>{getCategoryName(todo.categoryId)}</span>
              </div>
            )}

            {todo.description && (
              <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-xs'>
                <FileText className='h-3.5 w-3.5 text-muted-foreground' />
                <span className='max-w-[140px] truncate'>
                  {todo.description}
                </span>
              </div>
            )}

            {todo.dueDate && (
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-xs',
                  getTimeStatus(todo.dueDate) === 'red'
                    ? 'bg-red-100 text-red-700'
                    : getTimeStatus(todo.dueDate) === 'yellow'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-accent'
                )}
              >
                <Calendar className='h-3.5 w-3.5' />
                <span>{formatDate(todo.dueDate)}</span>
              </div>
            )}

            {todo.reminderTime && (
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-xs',
                  getTimeStatus(todo.reminderTime) === 'red'
                    ? 'bg-red-100 text-red-700'
                    : getTimeStatus(todo.reminderTime) === 'yellow'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-accent'
                )}
              >
                <AlarmClock className='h-3.5 w-3.5' />
                <span>{formatDate(todo.reminderTime)}</span>
              </div>
            )}

            {todo.completed && (
              <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs'>
                <CircleCheckBig className='h-3.5 w-3.5' />
                <span>{formatDate(todo.completedAt)}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className={cn(
            'h-8 w-8 shrink-0 mt-0.5 transition-all',
            todo.starred
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={e => onStar(e, todo)}
        >
          <Star
            className={cn(
              'h-4 w-4 transition-transform',
              todo.starred ? 'fill-yellow-500' : 'fill-none',
              todo.starred ? '' : 'hover:scale-110'
            )}
          />
        </Button>
      </div>
    </Card>
  )
}
