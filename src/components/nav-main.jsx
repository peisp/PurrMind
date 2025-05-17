"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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

  return (
    <div className="flex flex-col gap-1 p-2">
      {items.map((item) => (
        <Button
          key={item.title}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            (item.isActive || currentFilter === getFilterFromTitle(item.title)) && "bg-muted"
          )}
          onClick={() => handleClick(item)}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Button>
      ))}
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
