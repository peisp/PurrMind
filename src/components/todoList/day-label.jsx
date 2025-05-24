import React from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// 判断是昨天、今天、明天
export function getRelativeDayLabel(dateInput) {
  const date = new Date(dateInput)
  const today = new Date()
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const diffDays = Math.floor((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24))

  switch (diffDays) {
    case -1:
      return '昨天'
    case 0:
      return '今天'
    case 1:
      return '明天'
    default:
      return null
  }
}

export function DayLabel({ date, className }) {
  const day = new Date(date)
  const label = getRelativeDayLabel(day)
  const weekday = format(day, 'EEE', { locale: zhCN })

  const display = label ? `${label} ${weekday}` : format(day, 'MM-dd EEE', { locale: zhCN })

  return (
    <div className={cn(
      "my-2 text-sm font-semibold",
      label && "text-primary",
      className
    )}>
      {display}
    </div>
  )
}
