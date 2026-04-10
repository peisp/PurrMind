import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Repeat } from 'lucide-react'
import { cn } from '@/lib/utils.js'

const WEEKDAY_OPTIONS = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 0 }
]

/**
 * 统一的循环重复选择器
 *
 * 选择重复类型后，展开对应的时间配置：
 * - 每天 → 时间(时:分)
 * - 每周 → 周几 + 时间
 * - 每月 → 几号 + 时间
 *
 * onChange 回调返回 { recurrence, reminderTime }
 */
export function RecurrenceSelector({
  value,
  reminderTime,
  onChange,
  className
}) {
  const currentType = value?.type || 'none'

  // 从 reminderTime 或默认值提取时/分/周几/几号
  const ref = reminderTime ? new Date(reminderTime) : null
  const [hour, setHour] = useState(ref ? ref.getHours() : 9)
  const [minute, setMinute] = useState(ref ? ref.getMinutes() : 0)
  const [dayOfWeek, setDayOfWeek] = useState(
    value?.dayOfWeek ?? (ref ? ref.getDay() : 1)
  )
  const [dayOfMonth, setDayOfMonth] = useState(
    value?.dayOfMonth ?? (ref ? ref.getDate() : 1)
  )

  // 根据当前选择计算下一次 reminderTime
  const calcNextReminder = (type, dow, dom, h, m) => {
    const now = new Date()
    const target = new Date()
    target.setHours(h, m, 0, 0)

    switch (type) {
      case 'daily':
        // 如果今天这个时间已过，推到明天
        if (target <= now) target.setDate(target.getDate() + 1)
        break

      case 'weekly': {
        const currentDay = now.getDay()
        let diff = dow - currentDay
        if (diff < 0 || (diff === 0 && target <= now)) diff += 7
        target.setDate(target.getDate() + diff)
        break
      }

      case 'monthly': {
        target.setDate(dom)
        // 如果这个月这个日期的这个时间已过，推到下个月
        if (target <= now) {
          target.setMonth(target.getMonth() + 1)
        }
        // 处理月末溢出
        const maxDay = new Date(
          target.getFullYear(),
          target.getMonth() + 1,
          0
        ).getDate()
        if (dom > maxDay) target.setDate(maxDay)
        break
      }

      default:
        return null
    }

    return target
  }

  // 统一触发变更
  const emitChange = (type, dow, dom, h, m) => {
    if (type === 'none') {
      onChange({ recurrence: null, reminderTime: null })
      return
    }

    const recurrence = { type }
    if (type === 'weekly') recurrence.dayOfWeek = dow
    if (type === 'monthly') recurrence.dayOfMonth = dom

    const nextReminder = calcNextReminder(type, dow, dom, h, m)
    onChange({
      recurrence,
      reminderTime: nextReminder
    })
  }

  const handleTypeChange = type => {
    if (type === 'none') {
      emitChange('none', dayOfWeek, dayOfMonth, hour, minute)
      return
    }
    // 切换类型时用当前各参数重新计算
    emitChange(type, dayOfWeek, dayOfMonth, hour, minute)
  }

  const handleDayOfWeekChange = val => {
    const dow = parseInt(val)
    setDayOfWeek(dow)
    emitChange('weekly', dow, dayOfMonth, hour, minute)
  }

  const handleDayOfMonthChange = val => {
    const dom = Math.min(Math.max(parseInt(val) || 1, 1), 31)
    setDayOfMonth(dom)
    emitChange('monthly', dayOfWeek, dom, hour, minute)
  }

  const handleHourChange = val => {
    const h = Math.min(Math.max(parseInt(val) || 0, 0), 23)
    setHour(h)
    emitChange(currentType, dayOfWeek, dayOfMonth, h, minute)
  }

  const handleMinuteChange = val => {
    const m = Math.min(Math.max(parseInt(val) || 0, 0), 59)
    setMinute(m)
    emitChange(currentType, dayOfWeek, dayOfMonth, hour, m)
  }

  const handleTimeKeyDown = (type, e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    const delta = e.key === 'ArrowUp' ? 1 : -1

    if (type === 'hour') {
      const h = (hour + delta + 24) % 24
      setHour(h)
      emitChange(currentType, dayOfWeek, dayOfMonth, h, minute)
    } else {
      const m = (minute + delta + 60) % 60
      setMinute(m)
      emitChange(currentType, dayOfWeek, dayOfMonth, hour, m)
    }
  }

  const isActive = currentType !== 'none'

  return (
    <div className={cn('space-y-2', className)}>
      {/* 重复类型选择 */}
      <div className='space-y-0.5'>
        <label className='text-sm font-medium'>重复</label>
        <Select value={currentType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <div className='flex items-center gap-2'>
              <Repeat
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-blue-500' : 'text-muted-foreground'
                )}
              />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='none'>不重复</SelectItem>
            <SelectItem value='daily'>每天</SelectItem>
            <SelectItem value='weekly'>每周</SelectItem>
            <SelectItem value='monthly'>每月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 详细配置 - 仅在选择了重复类型后展开 */}
      {isActive && (
        <div className='space-y-2 pl-2 border-l-2 border-blue-200 dark:border-blue-800'>
          {/* 每周 - 周几选择 */}
          {currentType === 'weekly' && (
            <div className='space-y-0.5'>
              <label className='text-xs text-muted-foreground'>星期</label>
              <div className='flex gap-1'>
                {WEEKDAY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => handleDayOfWeekChange(opt.value)}
                    className={cn(
                      'flex-1 py-1.5 text-xs rounded-md border transition-colors',
                      dayOfWeek === opt.value
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-background border-input hover:bg-accent'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 每月 - 几号选择 */}
          {currentType === 'monthly' && (
            <div className='space-y-0.5'>
              <label className='text-xs text-muted-foreground'>日期</label>
              <div className='flex items-center gap-2'>
                <span className='text-sm'>每月</span>
                <Input
                  type='number'
                  min='1'
                  max='31'
                  value={dayOfMonth}
                  onChange={e => handleDayOfMonthChange(e.target.value)}
                  className='w-[60px] h-8 px-2 text-center'
                />
                <span className='text-sm'>号</span>
              </div>
            </div>
          )}

          {/* 时间选择 - 所有类型都有 */}
          <div className='space-y-0.5'>
            <label className='text-xs text-muted-foreground'>提醒时间</label>
            <div className='flex items-center gap-1'>
              <Input
                type='number'
                min='0'
                max='23'
                value={String(hour).padStart(2, '0')}
                onChange={e => handleHourChange(e.target.value)}
                onKeyDown={e => handleTimeKeyDown('hour', e)}
                className='w-[50px] h-8 px-2 text-center'
              />
              <span className='text-muted-foreground'>:</span>
              <Input
                type='number'
                min='0'
                max='59'
                value={String(minute).padStart(2, '0')}
                onChange={e => handleMinuteChange(e.target.value)}
                onKeyDown={e => handleTimeKeyDown('minute', e)}
                className='w-[50px] h-8 px-2 text-center'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
