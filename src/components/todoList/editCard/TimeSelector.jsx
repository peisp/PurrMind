import { Input } from '@/components/ui/input.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Calendar } from '@/components/ui/calendar.jsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover.jsx'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils.js'

export function TimeSelector({
  label,
  value,
  onChange,
  placeholder = '选择日期',
  className,
  showClearButton = false
}) {
  const handleTimeChange = (type, inputValue) => {
    if (!value) return

    const newDate = new Date(value)
    const numValue = parseInt(inputValue) || 0

    if (type === 'hour') {
      newDate.setHours(
        Math.min(Math.max(numValue, 0), 23),
        newDate.getMinutes(),
        0,
        0
      )
    } else {
      newDate.setMinutes(Math.min(Math.max(numValue, 0), 59), 0, 0)
    }

    onChange(newDate)
  }

  const handleTimeKeyDown = (type, e) => {
    if (!value) return

    const newDate = new Date(value)
    const currentValue =
      type === 'hour' ? newDate.getHours() : newDate.getMinutes()

    if (e.key === 'ArrowUp') {
      if (type === 'hour') {
        newDate.setHours((currentValue + 1) % 24, newDate.getMinutes(), 0, 0)
      } else {
        newDate.setMinutes((currentValue + 1) % 60, 0, 0)
      }
      onChange(newDate)
    } else if (e.key === 'ArrowDown') {
      if (type === 'hour') {
        newDate.setHours(
          (currentValue - 1 + 24) % 24,
          newDate.getMinutes(),
          0,
          0
        )
      } else {
        newDate.setMinutes((currentValue - 1 + 60) % 60, 0, 0)
      }
      onChange(newDate)
    }
  }

  return (
    <div className={cn('space-y-0.5', className)}>
      <label className='text-sm font-medium'>{label}</label>
      <div className='space-y-1'>
        <div className='flex gap-2'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'flex-1 justify-start text-left font-normal',
                  !value && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {value
                  ? (
                      format(value, 'yyyy-MM-dd', { locale: zhCN })
                    )
                  : (
                  <span>{placeholder}</span>
                    )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={value}
                onSelect={date => {
                  if (date) {
                    const newDate = new Date(date)
                    if (value) {
                      newDate.setHours(
                        value.getHours(),
                        value.getMinutes(),
                        0,
                        0
                      )
                    } else {
                      newDate.setHours(9, 0, 0, 0)
                    }
                    onChange(newDate)
                  } else {
                    onChange(null)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className='flex items-center gap-1'>
            <Input
              type='number'
              min='0'
              max='23'
              value={value ? format(value, 'HH') : ''}
              onChange={e => handleTimeChange('hour', e.target.value)}
              onKeyDown={e => handleTimeKeyDown('hour', e)}
              className='w-[50px] h-8 px-2 text-center'
              placeholder='时'
              disabled={!value}
            />
            <span className='text-muted-foreground'>:</span>
            <Input
              type='number'
              min='0'
              max='59'
              value={value ? format(value, 'mm') : ''}
              onChange={e => handleTimeChange('minute', e.target.value)}
              onKeyDown={e => handleTimeKeyDown('minute', e)}
              className='w-[50px] h-8 px-2 text-center'
              placeholder='分'
              disabled={!value}
            />
          </div>
        </div>
        {showClearButton && value && (
          <Button
            variant='outline'
            className='w-full'
            onClick={() => onChange(null)}
          >
            清除{label}
          </Button>
        )}
      </div>
    </div>
  )
}
