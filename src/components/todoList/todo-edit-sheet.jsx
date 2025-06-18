import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  CalendarIcon,
  Clock,
  Tag,
  AlertCircle,
  Sun,
  Calendar as CalendarDays,
  Settings,
  Repeat,
  ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import { addRecurringTask, getRecurringTaskByTodo, updateRecurringTask } from '@/db/todo.js'

const LimitedInput = ({ value, onChange, maxLength, placeholder, className }) => {
  return (
    <div className='space-y-0.5'>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn('', className)}
      />
      <div className='text-xs text-muted-foreground text-right'>
        {value.length}/{maxLength}
      </div>
    </div>
  )
}

const LimitedTextarea = ({ value, onChange, maxLength, placeholder, className }) => {
  return (
    <div className='space-y-0.5'>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(' resize-none', className)}
      />
      <div className='text-xs text-muted-foreground text-right'>
        {value.length}/{maxLength}
      </div>
    </div>
  )
}

export function TodoEditSheet ({
  isOpen,
  onOpenChange,
  todo,
  categories,
  onSave,
  onDelete,
  onCancel
}) {
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    dueDate: null,
    reminderTime: null,
    // 循环任务相关字段
    isRecurring: false,
    recurringType: 'daily', // 'daily' | 'weekly' | 'monthly' | 'custom'
    recurringConfig: {
      dailyTime: '09:00',
      weeklyDays: [1], // 默认周一
      weeklyTime: '09:00',
      monthlyDate: 1,
      monthlyTime: '09:00',
      intervalValue: 1,
      intervalUnit: 'days',
      customTime: '09:00'
    },
    repeatEndType: 'never', // 'never' | 'until' | 'count'
    repeatUntil: null,
    repeatCount: null,
    reminderEnabled: false,
    reminderOffset: 15 // 提前15分钟提醒
  })

  const [timeValidationError, setTimeValidationError] = useState('')
  const [validationErrors, setValidationErrors] = useState([])

  useEffect(() => {
    if (todo) {
      // 检查是否是循环任务实例，如果是则从模板加载配置
      const recurringTemplate = getRecurringTaskByTodo(todo)
      
      if (recurringTemplate) {
        // 这是一个循环任务实例，从模板加载配置
        setEditForm({
          title: todo.title || '',
          description: todo.description || '',
          categoryId: todo.categoryId || '',
          dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
          reminderTime: todo.reminderTime ? new Date(todo.reminderTime) : null,
          // 从循环任务模板加载配置
          isRecurring: true,
          recurringType: recurringTemplate.recurringType || 'daily',
          recurringConfig: recurringTemplate.recurringConfig || {
            dailyTime: '09:00',
            weeklyDays: [1],
            weeklyTime: '09:00',
            monthlyDate: 1,
            monthlyTime: '09:00',
            intervalValue: 1,
            intervalUnit: 'days',
            customTime: '09:00'
          },
          repeatEndType: recurringTemplate.repeatEndType || 'never',
          repeatUntil: recurringTemplate.repeatUntil || null,
          repeatCount: recurringTemplate.repeatCount || null,
          reminderEnabled: recurringTemplate.reminderEnabled || false,
          reminderOffset: recurringTemplate.reminderOffset || 15
        })
      } else {
        // 这是一个普通任务
        setEditForm({
          title: todo.title || '',
          description: todo.description || '',
          categoryId: todo.categoryId || '',
          dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
          reminderTime: todo.reminderTime ? new Date(todo.reminderTime) : null,
          // 循环任务相关字段 - 确保总是有默认值
          isRecurring: false,
          recurringType: 'daily',
          recurringConfig: {
            dailyTime: '09:00',
            weeklyDays: [1],
            weeklyTime: '09:00',
            monthlyDate: 1,
            monthlyTime: '09:00',
            intervalValue: 1,
            intervalUnit: 'days',
            customTime: '09:00'
          },
          repeatEndType: 'never',
          repeatUntil: null,
          repeatCount: null,
          reminderEnabled: false,
          reminderOffset: 15
        })
      }
    }
  }, [todo])

  // 监听列表变化
  useEffect(() => {
    // 如果当前选中的列表不存在于新的列表列表中，则清除列表选择
    if (editForm.categoryId && !categories.find(cat => cat.id === editForm.categoryId)) {
      setEditForm(prev => ({ ...prev, categoryId: null }))
    }
  }, [categories, editForm.categoryId])

  // 校验提醒时间是否在截止时间之前
  useEffect(() => {
    if (editForm.dueDate && editForm.reminderTime) {
      if (editForm.reminderTime >= editForm.dueDate) {
        setTimeValidationError('提醒时间必须在截止时间之前')
      } else {
        setTimeValidationError('')
      }
    } else {
      setTimeValidationError('')
    }
  }, [editForm.dueDate, editForm.reminderTime])

  // 表单校验函数
  const validateForm = () => {
    const errors = []

    // 基础校验
    if (!editForm.title.trim()) {
      errors.push('任务标题不能为空')
    }

    if (editForm.title.length > 50) {
      errors.push('任务标题不能超过50个字符')
    }

    if (editForm.description.length > 200) {
      errors.push('任务描述不能超过200个字符')
    }

    // 循环任务特殊校验
    if (editForm.isRecurring) {
      // 校验循环配置
      const config = editForm.recurringConfig || {}

      if (editForm.recurringType === 'weekly') {
        if (!config.weeklyDays || config.weeklyDays.length === 0) {
          errors.push('每周循环必须选择至少一天')
        }
      }

      if (editForm.recurringType === 'monthly') {
        if (!config.monthlyDate || config.monthlyDate < 1 || config.monthlyDate > 31) {
          errors.push('每月循环的日期必须在1-31之间')
        }
      }

      if (editForm.recurringType === 'custom') {
        if (!config.intervalValue || config.intervalValue < 1) {
          errors.push('自定义循环的间隔数值必须大于0')
        }
      }

      // 校验结束条件
      if (editForm.repeatEndType === 'until') {
        if (!editForm.repeatUntil) {
          errors.push('请选择循环结束日期')
        } else if (editForm.repeatUntil <= new Date()) {
          errors.push('循环结束日期必须在今天之后')
        }
      }

      if (editForm.repeatEndType === 'count') {
        if (!editForm.repeatCount || editForm.repeatCount < 1) {
          errors.push('重复次数必须大于0')
        }
      }
    } else {
      // 普通任务的时间校验
      if (timeValidationError) {
        errors.push(timeValidationError)
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  // 监听表单变化进行实时校验
  useEffect(() => {
    validateForm()
  }, [
    editForm.title,
    editForm.description,
    editForm.isRecurring,
    editForm.recurringType,
    editForm.recurringConfig,
    editForm.repeatEndType,
    editForm.repeatUntil,
    editForm.repeatCount,
    timeValidationError
  ])

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

  const handleSave = async () => {
    // 执行完整的表单校验
    if (!validateForm()) {
      return
    }

    let dueDate = editForm.dueDate
    if (dueDate) {
      const hours = dueDate.getHours()
      const minutes = dueDate.getMinutes()
      const seconds = dueDate.getSeconds()
      const milliseconds = dueDate.getMilliseconds()

      // 如果时间都是默认值，则不设置时间
      if (hours === 0 && minutes === 0 && seconds === 0 && milliseconds === 0) {
        dueDate = null
      }
    }

    let reminderTime = editForm.reminderTime
    if (reminderTime) {
      const hours = reminderTime.getHours()
      const minutes = reminderTime.getMinutes()
      const seconds = reminderTime.getSeconds()
      const milliseconds = reminderTime.getMilliseconds()

      // 如果时间都是默认值，则不设置时间
      if (hours === 0 && minutes === 0 && seconds === 0 && milliseconds === 0) {
        reminderTime = null
      }
    }

    // 如果是循环任务，保存循环任务配置
    if (editForm.isRecurring) {
      const recurringData = {
        title: editForm.title,
        description: editForm.description,
        categoryId: editForm.categoryId,
        starred: editForm.starred || false,
        recurringType: editForm.recurringType,
        recurringConfig: editForm.recurringConfig,
        repeatEndType: editForm.repeatEndType,
        repeatUntil: editForm.repeatUntil,
        repeatCount: editForm.repeatCount,
        reminderEnabled: editForm.reminderEnabled,
        reminderOffset: editForm.reminderOffset,
        startDate: new Date().toISOString(), // 从今天开始
        isActive: true
      }

      try {
        // 检查是否是编辑现有的循环任务实例
        const existingTemplate = getRecurringTaskByTodo(todo)
        
        if (existingTemplate) {
          // 更新现有的循环任务模板
          await updateRecurringTask(existingTemplate.id, recurringData)
        } else {
          // 创建新的循环任务模板
          await addRecurringTask(recurringData)
          
          // 如果是编辑现有的普通任务转换为循环任务，需要删除原有任务
          if (todo && todo.id && !todo.isRecurringInstance && !todo.recurringTaskId) {
            onDelete(todo.id)
          }
        }
        
        // 循环任务保存成功后关闭编辑页面
        onOpenChange(false)
        // 触发数据刷新事件
        window.dispatchEvent(new Event('todo-updated'))
      } catch (error) {
        console.error('Failed to save recurring task:', error)
        // 保存失败时可以显示错误提示，但不关闭页面
      }
    } else {
      // 处理普通任务的保存
      const updatedTodo = {
        ...todo,
        title: editForm.title,
        description: editForm.description,
        categoryId: editForm.categoryId,
        dueDate,
        reminderTime
      }
      onSave(updatedTodo)
    }
  }

  const handleTimeChange = (type, value, isReminder = false) => {
    const targetField = isReminder ? 'reminderTime' : 'dueDate'
    const currentDate = editForm[targetField]

    if (!currentDate) return

    const newDate = new Date(currentDate)

    if (type === 'hour') {
      const hour = Math.max(0, Math.min(23, parseInt(value) || 0))
      newDate.setHours(hour)
    } else if (type === 'minute') {
      const minute = Math.max(0, Math.min(59, parseInt(value) || 0))
      newDate.setMinutes(minute)
    }

    setEditForm({ ...editForm, [targetField]: newDate })
  }

  const handleTimeKeyDown = (type, e, isReminder = false) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const currentValue = parseInt(e.target.value) || 0
      const newValue = type === 'hour'
        ? Math.min(23, currentValue + 1)
        : Math.min(59, currentValue + 1)
      handleTimeChange(type, newValue.toString(), isReminder)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const currentValue = parseInt(e.target.value) || 0
      const newValue = type === 'hour'
        ? Math.max(0, currentValue - 1)
        : Math.max(0, currentValue - 1)
      handleTimeChange(type, newValue.toString(), isReminder)
    }
  }

  const getIconComponent = (iconName) => {
    return Icons[iconName] || Icons.Circle
  }

  const getColorClass = (color) => {
    const colorMap = {
      primary: 'bg-blue-500',
      secondary: 'bg-green-500',
      accent: 'bg-yellow-500',
      destructive: 'bg-red-500',
      muted: 'bg-gray-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500'
    }
    return colorMap[color] || 'bg-gray-500'
  }

  const updateRecurringConfig = (key, value) => {
    setEditForm(prev => ({
      ...prev,
      recurringConfig: {
        ...prev.recurringConfig,
        [key]: value
      }
    }))
  }

  const toggleWeeklyDay = (day) => {
    const currentDays = editForm.recurringConfig?.weeklyDays || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort((a, b) => a - b)

    updateRecurringConfig('weeklyDays', newDays)
  }

  const getWeekDayName = (day) => {
    const names = ['日', '一', '二', '三', '四', '五', '六']
    return names[day]
  }

  const renderRecurringTypeSelector = () => (
    <Select
      value={editForm.recurringType}
      onValueChange={(value) => setEditForm(prev => ({ ...prev, recurringType: value }))}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='daily'>每日</SelectItem>
        <SelectItem value='weekly'>每周</SelectItem>
        <SelectItem value='monthly'>每月</SelectItem>
        <SelectItem value='custom'>自定义</SelectItem>
      </SelectContent>
    </Select>
  )

  const renderRecurringConfig = () => {
    const config = editForm.recurringConfig || {}

    if (editForm.recurringType === 'daily') {
      return (
        <div className='space-y-2'>
          <label className='text-sm font-medium'>每日时间</label>
          <Input
            type='time'
            value={config.dailyTime || '09:00'}
            onChange={(e) => updateRecurringConfig('dailyTime', e.target.value)}
            className='w-full'
          />
        </div>
      )
    }

    if (editForm.recurringType === 'weekly') {
      return (
        <div className='space-y-3'>
          <div>
            <label className='text-sm font-medium mb-2 block'>选择星期</label>
            <div className='flex gap-1'>
              {[0, 1, 2, 3, 4, 5, 6].map(day => (
                <Button
                  key={day}
                  variant={(config.weeklyDays || []).includes(day) ? 'default' : 'outline'}
                  size='sm'
                  className='w-8 h-8 p-0'
                  onClick={() => toggleWeeklyDay(day)}
                >
                  {getWeekDayName(day)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className='text-sm font-medium'>时间</label>
            <Input
              type='time'
              value={config.weeklyTime || '09:00'}
              onChange={(e) => updateRecurringConfig('weeklyTime', e.target.value)}
              className='w-full'
            />
          </div>
        </div>
      )
    }

    if (editForm.recurringType === 'monthly') {
      return (
        <div className='space-y-3'>
          <div>
            <label className='text-sm font-medium'>每月日期</label>
            <Select
              value={(config.monthlyDate || 1).toString()}
              onValueChange={(value) => updateRecurringConfig('monthlyDate', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                  <SelectItem key={date} value={date.toString()}>
                    {date}号
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className='text-sm font-medium'>时间</label>
            <Input
              type='time'
              value={config.monthlyTime || '09:00'}
              onChange={(e) => updateRecurringConfig('monthlyTime', e.target.value)}
              className='w-full'
            />
          </div>
        </div>
      )
    }

    if (editForm.recurringType === 'custom') {
      return (
        <div className='space-y-3'>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <label className='text-sm font-medium'>间隔数值</label>
              <Input
                type='number'
                min='1'
                value={config.intervalValue || 1}
                onChange={(e) => updateRecurringConfig('intervalValue', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className='flex-1'>
              <label className='text-sm font-medium'>间隔单位</label>
              <Select
                value={config.intervalUnit || 'days'}
                onValueChange={(value) => updateRecurringConfig('intervalUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='days'>天</SelectItem>
                  <SelectItem value='weeks'>周</SelectItem>
                  <SelectItem value='months'>月</SelectItem>
                  <SelectItem value='years'>年</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className='text-sm font-medium'>时间</label>
            <Input
              type='time'
              value={config.customTime || '09:00'}
              onChange={(e) => updateRecurringConfig('customTime', e.target.value)}
              className='w-full'
            />
          </div>
        </div>
      )
    }

    return null
  }

  const renderEndCondition = () => (
    <div className='space-y-3'>
      <div>
        <label className='text-sm font-medium mb-2 block'>结束条件</label>
        <Select
          value={editForm.repeatEndType}
          onValueChange={(value) => setEditForm(prev => ({ ...prev, repeatEndType: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='never'>永不结束</SelectItem>
            <SelectItem value='until'>指定日期结束</SelectItem>
            <SelectItem value='count'>指定次数结束</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {editForm.repeatEndType === 'until' && (
        <div>
          <label className='text-sm font-medium'>结束日期</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !editForm.repeatUntil && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {editForm.repeatUntil
                  ? format(editForm.repeatUntil, 'yyyy-MM-dd', { locale: zhCN })
                  : '选择结束日期'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={editForm.repeatUntil}
                onSelect={(date) => setEditForm(prev => ({ ...prev, repeatUntil: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {editForm.repeatEndType === 'count' && (
        <div>
          <label className='text-sm font-medium'>重复次数</label>
          <Input
            type='number'
            min='1'
            value={editForm.repeatCount || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, repeatCount: parseInt(e.target.value) || null }))}
            placeholder='输入重复次数'
          />
        </div>
      )}
    </div>
  )

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className='w-[90vw] sm:w-[80vw] max-w-[700px] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>
            {todo?.id ? '编辑任务' : '新建任务'}
          </SheetTitle>
        </SheetHeader>
        <div className='space-y-3 py-4'>
          <div className='space-y-0.5'>
            <label className='text-sm font-medium'>任务标题</label>
            <LimitedInput
              value={editForm.title}
              onChange={(value) => setEditForm({ ...editForm, title: value })}
              maxLength={50}
              placeholder='请输入任务标题'
            />
          </div>

          <div className='space-y-0.5'>
            <label className='text-sm font-medium'>任务描述</label>
            <LimitedTextarea
              value={editForm.description}
              onChange={(value) => setEditForm({ ...editForm, description: value })}
              maxLength={200}
              placeholder='请输入任务描述'
              className='min-h-[60px] resize-none'
            />
          </div>

          <div className='space-y-0.5'>
            <label className='text-sm font-medium'>任务列表</label>
            <Select
              value={editForm.categoryId}
              onValueChange={(value) => setEditForm({ ...editForm, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder='选择任务列表' />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon)
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className='flex items-center gap-2'>
                        <div className={`w-3 h-3 rounded-full ${getColorClass(category.color)}`} />
                        <IconComponent className='w-4 h-4' />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 循环设置区域 */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Repeat className='h-4 w-4 text-muted-foreground' />
                <label className='text-sm font-medium'>循环任务</label>
              </div>
              <Switch
                checked={editForm.isRecurring}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isRecurring: checked }))}
              />
            </div>

            {editForm.isRecurring && (
              <Collapsible open className='space-y-4 p-4 bg-accent/20 rounded-lg border'>
                <div className='space-y-3'>
                  <div>
                    <label className='text-sm font-medium mb-2 block'>循环类型</label>
                    {renderRecurringTypeSelector()}
                  </div>

                  <div>
                    {renderRecurringConfig()}
                  </div>

                  <div>
                    {renderEndCondition()}
                  </div>

                  <div className='border-t pt-3'>
                    <div className='flex items-center justify-between'>
                      <label className='text-sm font-medium'>提醒设置</label>
                      <Switch
                        checked={editForm.reminderEnabled}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, reminderEnabled: checked }))}
                      />
                    </div>

                    {editForm.reminderEnabled && (
                      <div className='mt-2'>
                        <label className='text-sm font-medium'>提前提醒时间（分钟）</label>
                        <Select
                          value={editForm.reminderOffset.toString()}
                          onValueChange={(value) => setEditForm(prev => ({
                            ...prev,
                            reminderOffset: parseInt(value)
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='5'>5分钟前</SelectItem>
                            <SelectItem value='15'>15分钟前</SelectItem>
                            <SelectItem value='30'>30分钟前</SelectItem>
                            <SelectItem value='60'>1小时前</SelectItem>
                            <SelectItem value='120'>2小时前</SelectItem>
                            <SelectItem value='1440'>1天前</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </Collapsible>
            )}
          </div>
          {/* 截止时间 - 只在非循环任务时显示 */}
          {!editForm.isRecurring && (
            <div className='space-y-0.5'>
              <label className='text-sm font-medium'>截止时间</label>
              <div className='flex gap-2'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'flex-1 justify-start text-left font-normal ',
                        !editForm.dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {editForm.dueDate
                        ? (
                            format(editForm.dueDate, 'yyyy-MM-dd', { locale: zhCN })
                          )
                        : (
                          <span>选择日期</span>
                          )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={editForm.dueDate}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(date)
                          if (editForm.dueDate) {
                            newDate.setHours(
                              editForm.dueDate.getHours(),
                              editForm.dueDate.getMinutes(),
                              0,
                              0
                            )
                          } else {
                            newDate.setHours(9, 0, 0, 0)
                          }
                          setEditForm({ ...editForm, dueDate: newDate })
                        } else {
                          setEditForm({ ...editForm, dueDate: null })
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
                    value={editForm.dueDate ? format(editForm.dueDate, 'HH') : ''}
                    onChange={(e) => handleTimeChange('hour', e.target.value)}
                    onKeyDown={(e) => handleTimeKeyDown('hour', e)}
                    className='w-[50px] h-8 px-2 text-center '
                    placeholder='时'
                    disabled={!editForm.dueDate}
                  />
                  <span className='text-muted-foreground'>:</span>
                  <Input
                    type='number'
                    min='0'
                    max='59'
                    value={editForm.dueDate ? format(editForm.dueDate, 'mm') : ''}
                    onChange={(e) => handleTimeChange('minute', e.target.value)}
                    onKeyDown={(e) => handleTimeKeyDown('minute', e)}
                    className='w-[50px] h-8 px-2 text-center '
                    placeholder='分'
                    disabled={!editForm.dueDate}
                  />
                </div>
              </div>
            </div>
          )}
          {/* 提醒时间 - 只在非循环任务时显示 */}
          {!editForm.isRecurring && (
            <div className='space-y-0.5'>
              <label className='text-sm font-medium'>提醒时间</label>
              {/* eslint-disable-next-line multiline-ternary */}
              {!editForm.reminderTime ? (
                <Select
                  value=''
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      // 设置默认时间为当前时间+1小时
                      const defaultTime = new Date()
                      defaultTime.setHours(defaultTime.getHours() + 1, 0, 0, 0)
                      setEditForm({ ...editForm, reminderTime: defaultTime })
                      return
                    }
                    const selectedDate = new Date(value)
                    setEditForm({ ...editForm, reminderTime: selectedDate })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='选择提醒时间' />
                  </SelectTrigger>
                  <SelectContent>
                    {getReminderTimeOptions().map((option) => (
                      <SelectItem
                        key={option.label}
                        value={option.value === 'custom' ? 'custom' : option.value.toISOString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className='space-y-1'>
                  <div className='flex gap-2'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            'flex-1 justify-start text-left font-normal ',
                            !editForm.reminderTime && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {editForm.reminderTime
                            ? (
                                format(editForm.reminderTime, 'yyyy-MM-dd', { locale: zhCN })
                              )
                            : (
                              <span>选择日期</span>
                              )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={editForm.reminderTime}
                          onSelect={(date) => {
                            if (date) {
                              const newDate = new Date(date)
                              if (editForm.reminderTime) {
                                newDate.setHours(
                                  editForm.reminderTime.getHours(),
                                  editForm.reminderTime.getMinutes(),
                                  0,
                                  0
                                )
                              } else {
                                newDate.setHours(9, 0, 0, 0)
                              }
                              setEditForm({ ...editForm, reminderTime: newDate })
                            } else {
                              setEditForm({ ...editForm, reminderTime: null })
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
                        value={editForm.reminderTime ? format(editForm.reminderTime, 'HH') : ''}
                        onChange={(e) => handleTimeChange('hour', e.target.value, true)}
                        onKeyDown={(e) => handleTimeKeyDown('hour', e, true)}
                        className='w-[50px] h-8 px-2 text-center '
                        placeholder='时'
                        disabled={!editForm.reminderTime}
                      />
                      <span className='text-muted-foreground'>:</span>
                      <Input
                        type='number'
                        min='0'
                        max='59'
                        value={editForm.reminderTime ? format(editForm.reminderTime, 'mm') : ''}
                        onChange={(e) => handleTimeChange('minute', e.target.value, true)}
                        onKeyDown={(e) => handleTimeKeyDown('minute', e, true)}
                        className='w-[50px] h-8 px-2 text-center '
                        placeholder='分'
                        disabled={!editForm.reminderTime}
                      />
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    className='w-full '
                    onClick={() => {
                      setEditForm({ ...editForm, reminderTime: null })
                    }}
                  >
                    清除提醒时间
                  </Button>
                </div>
              )}
              {timeValidationError && (
                <div className='flex items-center gap-1 text-sm text-red-500'>
                  <AlertCircle className='h-4 w-4' />
                  <span>{timeValidationError}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* 校验错误提示 */}
        {validationErrors.length > 0 && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 mt-4'>
            <div className='flex items-start gap-2'>
              <AlertCircle className='h-4 w-4 text-red-500 mt-0.5 flex-shrink-0' />
              <div className='space-y-1'>
                <div className='text-sm font-medium text-red-800'>请修正以下问题：</div>
                <ul className='text-sm text-red-700 space-y-1'>
                  {validationErrors.map((error, index) => (
                    <li key={index} className='flex items-start gap-1'>
                      <span className='text-red-500'>•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <SheetFooter className='flex items-center justify-between pt-2 mt-2'>
          <div className='flex-1 text-xs text-muted-foreground'>
            创建于 {todo?.createdAt ? format(new Date(todo.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN }) : ''}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='destructive'
              onClick={onDelete}
            >
              删除
            </Button>
            <Button
              variant='outline'
              onClick={onCancel}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={validationErrors.length > 0}
            >
              保存
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
