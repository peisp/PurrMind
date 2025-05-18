import { useState } from 'react'
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
    onSave({
      ...editForm,
      dueDate: editForm.dueDate?.toISOString(),
      reminderTime: editForm.reminderTime?.toISOString()
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>编辑待办事项</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">标题</label>
            <Input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="输入标题"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">描述</label>
            <Textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="输入描述"
            />
          </div>
          <div className="space-y-2">
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
          <div className="space-y-2">
            <label className="text-sm font-medium">截止时间</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !editForm.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editForm.dueDate ? (
                    format(editForm.dueDate, "PPP", { locale: zhCN })
                  ) : (
                    <span>选择日期</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={editForm.dueDate}
                  onSelect={(date) => setEditForm({ ...editForm, dueDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">提醒时间</label>
            <Select
              value={editForm.reminderTime ? format(editForm.reminderTime, "yyyy-MM-dd HH:mm") : ""}
              onValueChange={(value) => {
                if (value === "custom") {
                  // 这里可以添加自定义时间的处理逻辑
                  return
                }
                setEditForm({ ...editForm, reminderTime: new Date(value) })
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
          </div>
          <div className="text-xs text-muted-foreground">
            创建于 {todo?.createdAt ? format(new Date(todo.createdAt), "PPP", { locale: zhCN }) : ''}
          </div>
        </div>
        <SheetFooter className="flex justify-between">
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