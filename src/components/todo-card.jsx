import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

export function TodoCard({ 
  todo, 
  onToggleStatus, 
  onStar, 
  onEdit, 
  getCategoryName 
}) {
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + (8 - nextWeek.getDay()))

    if (d.getTime() === today.getTime()) {
      return `今天 ${format(d, 'HH:mm')}`
    } else if (d.getTime() === tomorrow.getTime()) {
      return `明天 ${format(d, 'HH:mm')}`
    } else if (d.getTime() === nextWeek.getTime()) {
      return `下周一 ${format(d, 'HH:mm')}`
    } else {
      return format(d, 'MM月dd日 HH:mm', { locale: zhCN })
    }
  }

  return (
    <Card 
      className="p-2 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onEdit(todo)}
    >
      <div className="flex items-center gap-2">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={(checked) => {
            onToggleStatus(todo.id)
          }}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
            {todo.title}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="shrink-0">{getCategoryName(todo.categoryId)}</span>
            {todo.description && (
              <>
                <span className="shrink-0">•</span>
                <span className="truncate min-w-0 max-w-28">{todo.description}</span>
              </>
            )}
            {todo.dueDate && (
              <>
                <span className="shrink-0">•</span>
                <span className="shrink-0">截止于 {formatDate(todo.dueDate)}</span>
              </>
            )}
            {todo.reminderTime && (
              <>
                <span className="shrink-0">•</span>
                <span className="shrink-0">提醒于 {formatDate(todo.reminderTime)}</span>
              </>
            )}
            {todo.completed && (
              <>
                <span className="shrink-0">•</span>
                <span className="shrink-0">完成于 {formatDate(todo.completedAt)}</span>
              </>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 shrink-0",
            todo.starred && "text-yellow-500 hover:text-yellow-500"
          )}
          onClick={(e) => onStar(e, todo)}
        >
          <Star className={cn(
            "h-4 w-4",
            todo.starred ? "fill-yellow-500" : "fill-none"
          )} />
        </Button>
      </div>
    </Card>
  )
} 