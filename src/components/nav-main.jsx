"use client";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getAllTodos } from "@/db/todo"
import {
  CalendarIcon,
  ClockIcon,
  ListIcon,
  StarIcon,
  CheckCircleIcon,
} from "lucide-react"

const items = [
  { title: "今天", icon: ClockIcon, filter: "today", explain: "只统计今天到期的未完成任务", },
  { title: "计划", icon: CalendarIcon, filter: "planned", explain: "只统计未来到期的未完成任务", },
  { title: "全部", icon: ListIcon, filter: "all", explain: "只统计未完成的任务", },
  { title: "收藏", icon: StarIcon, filter: "starred", explain: "只统计未完成且已收藏的任务", },
  { title: "已完成", icon: CheckCircleIcon, filter: "completed", explain: "统计所有已完成的任务", }
]

export function NavMain({ onFilterChange, currentFilter }) {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    loadTodos()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('todo-updated', handleTodoUpdated)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('todo-updated', handleTodoUpdated)
    }
  }, [])

  const handleStorageChange = (e) => {
    if (e.key === 'todos') {
      loadTodos()
    }
  }

  const handleTodoUpdated = () => {
    loadTodos()
  }

  const loadTodos = () => {
    const allTodos = getAllTodos()
    setTodos(allTodos)
  }

  const getCount = (filter) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let count = 0
    switch (filter) {
      case "today":
        count = todos.filter(todo => {
          const todoDate = new Date(todo.dueDate)
          todoDate.setHours(0, 0, 0, 0)
          return !todo.completed && todoDate.getTime() === today.getTime()
        }).length
        break
      case "planned":
        count = todos.filter(todo => {
          const todoDate = new Date(todo.dueDate)
          todoDate.setHours(0, 0, 0, 0)
          return !todo.completed && todoDate.getTime() > today.getTime()
        }).length
        break
      case "all":
        count = todos.filter(todo => !todo.completed).length
        break
      case "starred":
        count = todos.filter(todo => !todo.completed && todo.starred).length
        break
      case "completed":
        count = todos.filter(todo => todo.completed).length
        break
      default:
        count = 0
    }
    return count > 99 ? "99+" : count
  }

  const handleClick = (filter) => {
    console.log('Filter clicked:', filter)
    onFilterChange(filter)
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = currentFilter === item.filter
        const count = getCount(item.filter)

        return (
          <Button
            key={item.filter}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "justify-between",
              isActive && "font-medium"
            )}
            onClick={() => handleClick(item.filter)}
          >
            <div className="flex items-center gap-2">
              <Icon className={cn(
                "h-4 w-4",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )} />
              <span className={isActive ? "text-primary-foreground" : ""}>
                {item.title}
              </span>
            </div>
            {item.filter !== "completed" && (
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs"
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
