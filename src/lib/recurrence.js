/**
 * 循环周期工具函数
 */

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/**
 * 计算下一个循环日期
 * @param {Date} currentDate - 当前日期
 * @param {Object} recurrence - 循环规则 { type, dayOfWeek, dayOfMonth }
 * @returns {Date} 下一个日期（保留时分秒）
 */
export function getNextOccurrence(currentDate, recurrence) {
  if (!recurrence || !recurrence.type) return null

  const next = new Date(currentDate)

  switch (recurrence.type) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break

    case 'weekly':
      next.setDate(next.getDate() + 7)
      break

    case 'monthly': {
      const targetDay = recurrence.dayOfMonth
      next.setMonth(next.getMonth() + 1)
      // 处理月末溢出（如1月31号 → 2月28号）
      const maxDay = new Date(
        next.getFullYear(),
        next.getMonth() + 1,
        0
      ).getDate()
      next.setDate(Math.min(targetDay, maxDay))
      break
    }

    default:
      return null
  }

  return next
}

/**
 * 推进循环任务到下一个周期
 *
 * 循环任务只用 reminderTime 驱动，dueDate 始终为 null
 *
 * @param {Object} todo - 待办事项
 * @returns {Object|null} 更新后的字段 { reminderTime }
 */
export function advanceRecurrence(todo) {
  if (!todo.recurrence || !todo.reminderTime) return null

  const currentReminder = new Date(todo.reminderTime)
  const nextReminder = getNextOccurrence(currentReminder, todo.recurrence)
  if (!nextReminder) return null

  return {
    reminderTime: nextReminder.toISOString()
  }
}

/**
 * 获取循环规则的显示文本
 * @param {Object} recurrence - 循环规则
 * @returns {string}
 */
export function getRecurrenceLabel(recurrence) {
  if (!recurrence || !recurrence.type) return ''

  switch (recurrence.type) {
    case 'daily':
      return '每天'
    case 'weekly':
      return `每${WEEKDAY_NAMES[recurrence.dayOfWeek]}`
    case 'monthly':
      return `每月${recurrence.dayOfMonth}号`
    default:
      return ''
  }
}
