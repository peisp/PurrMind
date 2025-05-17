"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getAllTodos } from '@/db/todo'

export function NavMain({ items, onFilterChange, currentFilter }) {
  const handleClick = (item) => {
    let filter = 'all'
    switch (item.title) {
      case '今天':
        filter = 'today'
        break
      case '计划':
        filter = 'planned'
        break
      case '全部':
        filter = 'all'
        break
      case '收藏':
        filter = 'starred'
        break
      case '已完成':
        filter = 'completed'
        break
      default:
        filter = 'all'
    }
    onFilterChange(filter)
  }

  const getCount = (title) => {
    const todos = getAllTodos()
    switch (title) {
      case '今天':
        const today = new Date().toISOString().split('T')[0]
        return todos.filter(todo => todo.createdAt.startsWith(today)).length
      case '计划':
        return todos.filter(todo => !todo.completed).length
      case '全部':
        return todos.length
      case '收藏':
        return todos.filter(todo => todo.starred).length
      case '已完成':
        return todos.filter(todo => todo.completed).length
      default:
        return 0
    }
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {items.map((item) => {
        const filter = getFilterFromTitle(item.title)
        const isActive = currentFilter === filter
        const count = getCount(item.title)
        return (
          <Button
            key={item.title}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-between gap-2",
              isActive && "font-medium"
            )}
            onClick={() => handleClick(item)}
          >
            <div className="flex items-center gap-2">
              <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
              {item.title}
            </div>
            {count > 0 && (
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
}

function getFilterFromTitle(title) {
  switch (title) {
    case '今天':
      return 'today'
    case '计划':
      return 'planned'
    case '全部':
      return 'all'
    case '收藏':
      return 'starred'
    case '已完成':
      return 'completed'
    default:
      return 'all'
  }
}
