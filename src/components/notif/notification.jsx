import { useEffect, useRef } from 'react'
import { barkService } from '@/services/bark'

export function Notification({ todos }) {
  const checkInterval = useRef(null)
  const notifiedTodos = useRef(new Set())

  // 发送通知的统一方法
  const sendNotification = async todo => {
    const title = todo.title
    const content = todo.description || '该任务需要您的关注'

    // 发送系统通知
    if (window.utools && window.utools.showNotification) {
      window.utools.showNotification(
        title,
        'index'
        // ,
        // {
        //   icon: 'https://res.u-tools.cn/plugins/logo/tmdyai7glykmor3my3vp2sy88dao1fgk.png',
        //   sound: true
        // }
      )
    }

    // 发送Bark推送
    try {
      const result = await barkService.sendNotification(title, content, {
        sound: 'alarm', // 提醒任务使用闹钟声音
        group: '喵咚咚任务提醒'
      })

      if (result.success) {
        console.log('Bark推送发送成功:', result.message)
      } else {
        console.warn('Bark推送发送失败:', result.error)
      }
    } catch (error) {
      console.error('Bark推送错误:', error)
    }
  }

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
            // 使用统一的通知发送方法
            sendNotification(todo)
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
