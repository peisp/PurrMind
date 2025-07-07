import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.jsx'
import { TimeSelector } from './TimeSelector.jsx'
import { AlertCircle } from 'lucide-react'

export function ReminderTimeSelector({
  value,
  onChange,
  dueDate,
  validationError,
  className
}) {
  const getReminderTimeOptions = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)

    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + (8 - nextWeek.getDay()))
    nextWeek.setHours(9, 0, 0, 0)

    const oneHourLater = new Date(now)
    oneHourLater.setHours(oneHourLater.getHours() + 1)

    return [
      { label: '稍后（一小时后）', value: oneHourLater },
      { label: '明天（上午9:00）', value: tomorrow },
      { label: '下周（周一上午9:00）', value: nextWeek },
      { label: '自定义时间', value: 'custom' }
    ]
  }

  const handleQuickSelect = selectedValue => {
    if (selectedValue === 'custom') {
      // 设置默认时间为当前时间+1小时
      const defaultTime = new Date()
      defaultTime.setHours(defaultTime.getHours() + 1, 0, 0, 0)
      onChange(defaultTime)
      return
    }
    const selectedDate = new Date(selectedValue)
    onChange(selectedDate)
  }

  return (
    <div className={className}>
      {!value
        ? (
        <div className='space-y-0.5'>
          <label className='text-sm font-medium'>提醒时间</label>
          <Select value='' onValueChange={handleQuickSelect}>
            <SelectTrigger>
              <SelectValue placeholder='选择提醒时间' />
            </SelectTrigger>
            <SelectContent>
              {getReminderTimeOptions().map(option => (
                <SelectItem
                  key={option.label}
                  value={
                    option.value === 'custom'
                      ? 'custom'
                      : option.value.toISOString()
                  }
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
          )
        : (
        <TimeSelector
          label='提醒时间'
          value={value}
          onChange={onChange}
          placeholder='选择提醒日期'
          showClearButton
        />
          )}

      {validationError && (
        <div className='flex items-center gap-1 text-sm text-red-500 mt-1'>
          <AlertCircle className='h-4 w-4' />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  )
}
