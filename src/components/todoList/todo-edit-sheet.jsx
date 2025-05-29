import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Clock, Tag, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"

const LimitedInput = ({ value, onChange, maxLength, placeholder, className }) => {
  return (
    <div className="space-y-0.5">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn("", className)}
      />
      <div className="text-xs text-muted-foreground text-right">
        {value.length}/{maxLength}
      </div>
    </div>
  )
}

const LimitedTextarea = ({ value, onChange, maxLength, placeholder, className }) => {
  return (
    <div className="space-y-0.5">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(" resize-none", className)}
      />
      <div className="text-xs text-muted-foreground text-right">
        {value.length}/{maxLength}
      </div>
    </div>
  )
}

export function TodoEditSheet({
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
    reminderTime: null
  })

  const [timeValidationError, setTimeValidationError] = useState('')

  useEffect(() => {
    if (todo) {
      setEditForm({
        title: todo.title || '',
        description: todo.description || '',
        categoryId: todo.categoryId || '',
        dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime) : null
      })
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

  const handleSave = () => {
    // 如果有时间校验错误，不允许保存
    if (timeValidationError) {
      return
    }

    let dueDate = editForm.dueDate
    if (dueDate) {
      const hours = dueDate.getHours()
      const minutes = dueDate.getMinutes()
      if (hours === 0 && minutes === 0) {
        dueDate = new Date(dueDate)
        dueDate.setHours(9, 0, 0, 0)
      }
    }

    onSave({
      ...editForm,
      dueDate: dueDate?.toISOString(),
      reminderTime: editForm.reminderTime?.toISOString()
    })
  }

  const handleTimeChange = (type, value, isReminder = false) => {
    const targetDate = isReminder ? editForm.reminderTime : editForm.dueDate
    if (!targetDate) return

    const newDate = new Date(targetDate)
    const numValue = parseInt(value) || 0

    if (type === 'hour') {
      newDate.setHours(Math.min(Math.max(numValue, 0), 23), newDate.getMinutes(), 0, 0)
    } else {
      newDate.setMinutes(Math.min(Math.max(numValue, 0), 59), 0, 0)
    }

    if (isReminder) {
      setEditForm({ ...editForm, reminderTime: newDate })
    } else {
      setEditForm({ ...editForm, dueDate: newDate })
    }
  }

  const handleTimeKeyDown = (type, e, isReminder = false) => {
    const targetDate = isReminder ? editForm.reminderTime : editForm.dueDate
    if (!targetDate) return

    const newDate = new Date(targetDate)
    const currentValue = type === 'hour' ? newDate.getHours() : newDate.getMinutes()

    if (e.key === 'ArrowUp') {
      if (type === 'hour') {
        newDate.setHours((currentValue + 1) % 24, newDate.getMinutes(), 0, 0)
      } else {
        newDate.setMinutes((currentValue + 1) % 60, 0, 0)
      }
      if (isReminder) {
        setEditForm({ ...editForm, reminderTime: newDate })
      } else {
        setEditForm({ ...editForm, dueDate: newDate })
      }
    } else if (e.key === 'ArrowDown') {
      if (type === 'hour') {
        newDate.setHours((currentValue - 1 + 24) % 24, newDate.getMinutes(), 0, 0)
      } else {
        newDate.setMinutes((currentValue - 1 + 60) % 60, 0, 0)
      }
      if (isReminder) {
        setEditForm({ ...editForm, reminderTime: newDate })
      } else {
        setEditForm({ ...editForm, dueDate: newDate })
      }
    }
  }

  const getIconComponent = (iconName) => {
    return Icons[iconName] || Icons.FolderIcon
  }

  const getColorClass = (color) => {
    switch (color) {
      case 'red':
        return 'text-red-500'
      case 'blue':
        return 'text-blue-500'
      case 'green':
        return 'text-green-500'
      case 'yellow':
        return 'text-yellow-500'
      case 'purple':
        return 'text-purple-500'
      case 'pink':
        return 'text-pink-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-2 flex flex-col">
        <SheetHeader>
          <SheetTitle>编辑待办事项</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-1 overflow-y-auto">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">标题</label>
            <LimitedInput
              value={editForm.title}
              onChange={(value) => setEditForm({ ...editForm, title: value })}
              maxLength={50}
              placeholder="输入标题"
            />
          </div>
          <div className="space-y-0.5">
            <label className="text-sm font-medium">描述</label>
            <LimitedTextarea
              value={editForm.description}
              onChange={(value) => setEditForm({ ...editForm, description: value })}
              maxLength={200}
              placeholder="输入描述"
            />
          </div>
          <div className="space-y-0.5">
            <label className="text-sm font-medium">列表</label>
            <Select 
              value={editForm.categoryId || "none"} 
              onValueChange={(value) => setEditForm({ ...editForm, categoryId: value === "none" ? null : value })}
            >
              <SelectTrigger className=" data-[state=open]:ring-0 data-[state=open]:ring-offset-0 data-[state=closed]:ring-0 data-[state=closed]:ring-offset-0 ring-0 ring-offset-0">
                <SelectValue placeholder="选择列表">
                  {editForm.categoryId ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-50 rounded-full h-6 w-6 flex items-center justify-center">
                        {(() => {
                          const category = categories.find(cat => cat.id === editForm.categoryId)
                          const Icon = getIconComponent(category?.icon)
                          return <Icon className={cn('h-4 w-4', getColorClass(category?.color))} />
                        })()}
                      </div>
                      <span>{categories.find(cat => cat.id === editForm.categoryId)?.name || "未知列表"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-50 rounded-full h-6 w-6 flex items-center justify-center">
                        <Icons.FolderIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <span>无列表</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-50 rounded-full h-6 w-6 flex items-center justify-center">
                      <Icons.FolderIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <span>无列表</span>
                  </div>
                </SelectItem>
                {categories.map((category) => {
                  const Icon = getIconComponent(category.icon)
                  return (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-amber-50 rounded-full h-6 w-6 flex items-center justify-center">
                          <Icon className={cn('h-4 w-4', getColorClass(category.color))} />
                        </div>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-0.5">
            <label className="text-sm font-medium">截止时间</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal ",
                      !editForm.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editForm.dueDate ? (
                      format(editForm.dueDate, "yyyy-MM-dd", { locale: zhCN })
                    ) : (
                      <span>选择日期</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
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
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={editForm.dueDate ? format(editForm.dueDate, "HH") : ""}
                  onChange={(e) => handleTimeChange('hour', e.target.value)}
                  onKeyDown={(e) => handleTimeKeyDown('hour', e)}
                  className="w-[50px] h-8 px-2 text-center "
                  placeholder="时"
                  disabled={!editForm.dueDate}
                />
                <span className="text-muted-foreground">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={editForm.dueDate ? format(editForm.dueDate, "mm") : ""}
                  onChange={(e) => handleTimeChange('minute', e.target.value)}
                  onKeyDown={(e) => handleTimeKeyDown('minute', e)}
                  className="w-[50px] h-8 px-2 text-center "
                  placeholder="分"
                  disabled={!editForm.dueDate}
                />
              </div>
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-sm font-medium">提醒时间</label>
            {!editForm.reminderTime ? (
              <Select
                value=""
                onValueChange={(value) => {
                  if (value === "custom") {
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
                  <SelectValue placeholder="选择提醒时间" />
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
              <div className="space-y-1">
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal ",
                          !editForm.reminderTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editForm.reminderTime ? (
                          format(editForm.reminderTime, "yyyy-MM-dd", { locale: zhCN })
                        ) : (
                          <span>选择日期</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
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
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={editForm.reminderTime ? format(editForm.reminderTime, "HH") : ""}
                      onChange={(e) => handleTimeChange('hour', e.target.value, true)}
                      onKeyDown={(e) => handleTimeKeyDown('hour', e, true)}
                      className="w-[50px] h-8 px-2 text-center "
                      placeholder="时"
                      disabled={!editForm.reminderTime}
                    />
                    <span className="text-muted-foreground">:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={editForm.reminderTime ? format(editForm.reminderTime, "mm") : ""}
                      onChange={(e) => handleTimeChange('minute', e.target.value, true)}
                      onKeyDown={(e) => handleTimeKeyDown('minute', e, true)}
                      className="w-[50px] h-8 px-2 text-center "
                      placeholder="分"
                      disabled={!editForm.reminderTime}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full "
                  onClick={() => {
                    setEditForm({ ...editForm, reminderTime: null })
                  }}
                >
                  清除提醒时间
                </Button>
              </div>
            )}
            {timeValidationError && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{timeValidationError}</span>
              </div>
            )}
          </div>
        </div>
        <SheetFooter className="flex items-center justify-between pt-2 mt-2">
          <div className="flex-1 text-xs text-muted-foreground">
            创建于 {todo?.createdAt ? format(new Date(todo.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN }) : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="destructive" 
              onClick={onDelete}
            >
              删除
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              取消
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!!timeValidationError}
            >
              保存
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
