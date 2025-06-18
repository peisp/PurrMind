import { useEffect, useRef } from 'react'

export function Notification ({ todos }) {
  const checkInterval = useRef(null)
  const notifiedTodos = useRef(new Set())

  useEffect(() => {
    // 每分钟检查一次提醒时间
    checkInterval.current = setInterval(() => {
      const now = new Date()
      todos.forEach(todo => {
        if (
          todo.reminderTime &&
          !todo.completed &&
          !notifiedTodos.current.has(todo.id)
        ) {
          const reminderTime = new Date(todo.reminderTime)
          // 如果提醒时间在当前时间的前后1分钟内
          if (Math.abs(reminderTime - now) <= 60000) {
            window.utools.showNotification(
              todo.title,
              todo.description || '该任务需要您的关注',
              {
                icon: 'https://example.com/icon.png', // 可以替换为实际的图标
                sound: true
              }
            )
            // 记录已通知的任务
            notifiedTodos.current.add(todo.id)
          }
        }
      })
    }, 60000) // 60000ms = 1分钟

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current)
      }
    }
  }, [todos])

  // 当任务列表更新时，重置已通知的任务集合
  useEffect(() => {
    notifiedTodos.current.clear()
  }, [todos])

  return null
}
