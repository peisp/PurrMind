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
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { cn } from "@/lib/utils"

const LimitedInput = ({ value, onChange, maxLength, placeholder, className }) => {
  return (
    <div className="space-y-1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn("focus-visible:ring-0 focus-visible:ring-offset-0", className)}
      />
      <div className="text-xs text-muted-foreground text-right">
        {value.length}/{maxLength}
      </div>
    </div>
  )
}

const LimitedTextarea = ({ value, onChange, maxLength, placeholder, className }) => {
  return (
    <div className="space-y-1">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn("focus-visible:ring-0 focus-visible:ring-offset-0", className)}
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
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false)

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

  const getTimeOptions = () => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date()
        time.setHours(hour, minute, 0, 0)
        times.push({
          label: format(time, 'HH:mm'),
          value: time.toISOString()
        })
      }
    }
    return times
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-3 flex flex-col">
        <SheetHeader className="pb-2">
          <SheetTitle>编辑待办事项</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">标题</label>
            <LimitedInput
              value={editForm.title}
              onChange={(value) => setEditForm({ ...editForm, title: value })}
              maxLength={50}
              placeholder="输入标题"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">描述</label>
            <LimitedTextarea
              value={editForm.description}
              onChange={(value) => setEditForm({ ...editForm, description: value })}
              maxLength={200}
              placeholder="输入描述"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">分类</label>
            <Select 
              value={editForm.categoryId || "none"} 
              onValueChange={(value) => setEditForm({ ...editForm, categoryId: value === "none" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无分类</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">截止时间</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
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
              <Select
                value={editForm.dueDate ? format(editForm.dueDate, "HH:mm") : ""}
                onValueChange={(value) => {
                  if (editForm.dueDate) {
                    const [hours, minutes] = value.split(':').map(Number)
                    const newDate = new Date(editForm.dueDate)
                    newDate.setHours(hours, minutes, 0, 0)
                    setEditForm({ ...editForm, dueDate: newDate })
                  }
                }}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="选择时间" />
                </SelectTrigger>
                <SelectContent>
                  {getTimeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">提醒时间</label>
            {!showCustomTimePicker ? (
              <Select
                value={editForm.reminderTime ? format(editForm.reminderTime, "yyyy-MM-dd HH:mm") : ""}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setShowCustomTimePicker(true)
                    return
                  }
                  const selectedDate = new Date(value)
                  setEditForm({ ...editForm, reminderTime: selectedDate })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择提醒时间">
                    {editForm.reminderTime && format(editForm.reminderTime, "yyyy-MM-dd HH:mm")}
                  </SelectValue>
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
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
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
                  <Select
                    value={editForm.reminderTime ? format(editForm.reminderTime, "HH:mm") : ""}
                    onValueChange={(value) => {
                      if (editForm.reminderTime) {
                        const [hours, minutes] = value.split(':').map(Number)
                        const newDate = new Date(editForm.reminderTime)
                        newDate.setHours(hours, minutes, 0, 0)
                        setEditForm({ ...editForm, reminderTime: newDate })
                      }
                    }}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="选择时间" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTimeOptions().map((option) => (
                        <SelectItem key={option.value} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowCustomTimePicker(false)
                    setEditForm({ ...editForm, reminderTime: null })
                  }}
                >
                  返回预设时间
                </Button>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            创建于 {todo?.createdAt ? format(new Date(todo.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN }) : ''}
          </div>
        </div>
        <SheetFooter className="flex justify-between pt-2 mt-2">
          <Button 
            variant="destructive" 
            onClick={onDelete}
          >
            删除
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
} 