// 循环任务实例生成核心逻辑
import { getRecurringTask, getTaskByRecurringInstance, getAllRecurringTasks } from './todo.js'

/**
 * 根据循环任务配置计算下一次出现的时间
 * @param {Object} template 循环任务模板
 * @param {Date} currentDate 当前日期
 * @returns {Date|null} 下一次出现的时间，如果没有则返回null
 */
export function getNextOccurrence(template, currentDate) {
  const { recurringType, recurringConfig } = template
  const nextDate = new Date(currentDate)
  
  switch (recurringType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1)
      const [dailyHour, dailyMinute] = (recurringConfig.dailyTime || '09:00').split(':')
      nextDate.setHours(parseInt(dailyHour), parseInt(dailyMinute), 0, 0)
      break
      
    case 'weekly':
      const weeklyDays = recurringConfig.weeklyDays || [1] // 默认周一
      const [weeklyHour, weeklyMinute] = (recurringConfig.weeklyTime || '09:00').split(':')
      
      // 找到下一个指定的星期几
      const currentDayOfWeek = nextDate.getDay()
      let daysToAdd = 1
      
      // 寻找下一个符合条件的星期几
      for (let i = 1; i <= 7; i++) {
        const targetDay = (currentDayOfWeek + i) % 7
        if (weeklyDays.includes(targetDay)) {
          daysToAdd = i
          break
        }
      }
      
      nextDate.setDate(nextDate.getDate() + daysToAdd)
      nextDate.setHours(parseInt(weeklyHour), parseInt(weeklyMinute), 0, 0)
      break
      
    case 'monthly':
      const monthlyDate = recurringConfig.monthlyDate || 1
      const [monthlyHour, monthlyMinute] = (recurringConfig.monthlyTime || '09:00').split(':')
      
      // 设置为下个月的指定日期
      nextDate.setMonth(nextDate.getMonth() + 1)
      
      // 处理月末日期（如31号在2月不存在）
      const daysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()
      const targetDate = Math.min(monthlyDate, daysInMonth)
      
      nextDate.setDate(targetDate)
      nextDate.setHours(parseInt(monthlyHour), parseInt(monthlyMinute), 0, 0)
      break
      
    case 'custom':
      const { intervalValue = 1, intervalUnit = 'days', customTime = '09:00' } = recurringConfig
      const [customHour, customMinute] = customTime.split(':')
      
      switch (intervalUnit) {
        case 'days':
          nextDate.setDate(nextDate.getDate() + intervalValue)
          break
        case 'weeks':
          nextDate.setDate(nextDate.getDate() + (intervalValue * 7))
          break
        case 'months':
          nextDate.setMonth(nextDate.getMonth() + intervalValue)
          break
      }
      
      nextDate.setHours(parseInt(customHour), parseInt(customMinute), 0, 0)
      break
      
    default:
      return null
  }
  
  return nextDate
}

/**
 * 判断是否应该在指定日期生成实例
 * @param {Object} template 循环任务模板
 * @param {Date} date 要检查的日期
 * @returns {boolean} 是否应该生成实例
 */
export function shouldGenerateInstance(template, date) {
  const { recurringType, recurringConfig, startDate } = template
  const checkDate = new Date(date)
  const start = new Date(startDate)
  
  // 检查是否在开始日期之前
  if (checkDate < start) return false
  
  switch (recurringType) {
    case 'daily':
      return true // 每天都生成
      
    case 'weekly':
      const weeklyDays = recurringConfig.weeklyDays || [1]
      const dayOfWeek = checkDate.getDay()
      return weeklyDays.includes(dayOfWeek)
      
    case 'monthly':
      const monthlyDate = recurringConfig.monthlyDate || 1
      return checkDate.getDate() === monthlyDate
      
    case 'custom':
      const { intervalValue = 1, intervalUnit = 'days' } = recurringConfig
      const diffTime = checkDate.getTime() - start.getTime()
      
      switch (intervalUnit) {
        case 'days':
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          return diffDays % intervalValue === 0
        case 'weeks':
          const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
          return diffWeeks % intervalValue === 0 && checkDate.getDay() === start.getDay()
        case 'months':
          const diffMonths = (checkDate.getFullYear() - start.getFullYear()) * 12 + 
                           (checkDate.getMonth() - start.getMonth())
          return diffMonths % intervalValue === 0 && checkDate.getDate() === start.getDate()
      }
      break
  }
  
  return false
}

/**
 * 判断是否应该继续生成实例（检查结束条件）
 * @param {Object} template 循环任务模板
 * @param {Date} currentDate 当前日期
 * @param {number} generatedCount 已生成的实例数量
 * @returns {boolean} 是否应该继续生成
 */
export function shouldContinueGenerate(template, currentDate, generatedCount) {
  const { repeatEndType, repeatUntil, repeatCount } = template
  
  switch (repeatEndType) {
    case 'never':
      return true
      
    case 'until':
      if (!repeatUntil) return true
      return new Date(currentDate) <= new Date(repeatUntil)
      
    case 'count':
      if (!repeatCount) return true
      return generatedCount < repeatCount
      
    default:
      return true
  }
}

/**
 * 创建循环任务实例
 * @param {Object} template 循环任务模板
 * @param {Date} instanceDate 实例日期
 * @returns {Object} 实例任务对象
 */
export function createInstance(template, instanceDate) {
  const { recurringType, recurringConfig, reminderEnabled, reminderOffset } = template
  
  // 根据循环类型设置具体时间
  const dueDate = new Date(instanceDate)
  let timeConfig = '09:00' // 默认时间
  
  switch (recurringType) {
    case 'daily':
      timeConfig = recurringConfig.dailyTime || '09:00'
      break
    case 'weekly':
      timeConfig = recurringConfig.weeklyTime || '09:00'
      break
    case 'monthly':
      timeConfig = recurringConfig.monthlyTime || '09:00'
      break
    case 'custom':
      timeConfig = recurringConfig.customTime || '09:00'
      break
  }
  
  const [hour, minute] = timeConfig.split(':')
  dueDate.setHours(parseInt(hour), parseInt(minute), 0, 0)
  
  // 计算提醒时间
  let reminderTime = null
  if (reminderEnabled && reminderOffset > 0) {
    reminderTime = new Date(dueDate.getTime() - (reminderOffset * 60 * 1000))
  }
  
  return {
    id: `recurring_${template.id}_${instanceDate.getTime()}`, // 临时ID，用于虚拟实例
    title: template.title,
    description: template.description,
    categoryId: template.categoryId,
    starred: template.starred,
    completed: false,
    dueDate: dueDate.toISOString(),
    reminderTime: reminderTime?.toISOString() || null,
    recurringTaskId: template.id,
    isRecurringInstance: true,
    instanceDate: instanceDate.toISOString(),
    isVirtual: true, // 标记为虚拟实例，未持久化
    createdAt: template.createdAt,
    updatedAt: template.updatedAt
  }
}

/**
 * 根据模板和时间范围生成实例
 * @param {Object} template 循环任务模板
 * @param {Date} startDate 开始日期
 * @param {Date} endDate 结束日期
 * @returns {Array} 实例任务数组
 */
export function generateRecurringInstances(template, startDate, endDate) {
  if (!template.isActive) return []
  
  const instances = []
  const current = new Date(Math.max(new Date(template.startDate), startDate))
  const end = new Date(endDate)
  
  while (current <= end && shouldContinueGenerate(template, current, instances.length)) {
    if (shouldGenerateInstance(template, current)) {
      // 检查是否已经有物理实例存在
      const existingTask = getTaskByRecurringInstance(template.id, current)
      
      if (existingTask) {
        // 使用已存在的物理实例
        instances.push({
          ...existingTask,
          isVirtual: false
        })
      } else {
        // 生成虚拟实例
        instances.push(createInstance(template, current))
      }
    }
    
    const nextDate = getNextOccurrence(template, current)
    if (!nextDate || nextDate <= current) {
      // 防止无限循环
      current.setDate(current.getDate() + 1)
    } else {
      current.setTime(nextDate.getTime())
    }
  }
  
  return instances
}

/**
 * 获取指定时间范围内的所有循环任务实例
 * @param {Date} startDate 开始日期
 * @param {Date} endDate 结束日期
 * @returns {Array} 所有实例任务数组
 */
export function getAllRecurringInstancesInRange(startDate, endDate) {
  const allTemplates = getAllRecurringTasks()
  const allInstances = []
  
  allTemplates.forEach(template => {
    const instances = generateRecurringInstances(template, startDate, endDate)
    allInstances.push(...instances)
  })
  
  // 按日期排序
  return allInstances.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
}

/**
 * 获取某个日期的所有循环任务实例
 * @param {Date} date 指定日期
 * @returns {Array} 该日期的实例任务数组
 */
export function getRecurringInstancesForDate(date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  return getAllRecurringInstancesInRange(startOfDay, endOfDay)
} 