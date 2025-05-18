import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getAllCategories } from "@/db/todo"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
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

export function TodoList({ todos, onUpdate, onDelete, onToggleStatus }) {
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ 
    title: '', 
    description: '',
    categoryId: '',
    dueDate: null,
    reminderTime: null
  })
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = () => {
    const allCategories = getAllCategories()
    setCategories(allCategories)
  }

  const handleEdit = (todo) => {
    setEditingId(todo.id)
    setEditForm({
      title: todo.title,
      description: todo.description,
      categoryId: todo.categoryId || '',
      dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
      reminderTime: todo.reminderTime ? new Date(todo.reminderTime) : null
    })
    setIsSheetOpen(true)
  }

  const handleSave = (id) => {
    onUpdate(id, {
      ...editForm,
      dueDate: editForm.dueDate?.toISOString(),
      reminderTime: editForm.reminderTime?.toISOString()
    })
    setEditingId(null)
    setIsSheetOpen(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsSheetOpen(false)
  }

  const handleStar = (e, todo) => {
    e.stopPropagation()
    onUpdate(todo.id, { ...todo, starred: !todo.starred })
  }

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "无分类"
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : "未知分类"
  }

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

  if (todos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">暂无待办事项</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-1">
        {todos.map((todo) => (
          <Card 
            key={todo.id} 
            className="p-2 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => handleEdit(todo)}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(checked) => {
                  onToggleStatus(todo.id)
                }}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {todo.title}
                </h3>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="shrink-0">{getCategoryName(todo.categoryId)}</span>
                  {todo.description && (
                    <>
                      <span className="shrink-0">•</span>
                      <span className="truncate min-w-0 max-w-28">{todo.description}</span>
                    </>
                  )}
                  {todo.dueDate && (
                    <>
                      <span className="shrink-0">•</span>
                      <span className="shrink-0">截止于 {new Date(todo.dueDate).toLocaleString()}</span>
                    </>
                  )}
                  {todo.completed && (
                    <>
                      <span className="shrink-0">•</span>
                      <span className="shrink-0">完成于 {new Date(todo.completedAt).toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 shrink-0",
                  todo.starred && "text-yellow-500 hover:text-yellow-500"
                )}
                onClick={(e) => handleStar(e, todo)}
              >
                <Star className={cn(
                  "h-4 w-4",
                  todo.starred ? "fill-yellow-500" : "fill-none"
                )} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
              创建于 {new Date(editingId ? todos.find(t => t.id === editingId)?.createdAt : '').toLocaleString()}
            </div>
          </div>
          <SheetFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete(editingId)
                setIsSheetOpen(false)
              }}
            >
              删除
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button onClick={() => handleSave(editingId)}>
                保存
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
} 