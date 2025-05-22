import { useState, useEffect } from 'react'
import { getAllCategories } from "@/db/todo"
import { TodoCard } from './todo-card'
import { TodoEditSheet } from './todo-edit-sheet'
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

export function TodoList({ todos, onUpdate, onDelete, onToggleStatus }) {
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    loadCategories()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('todo-updated', handleTodoUpdated)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('todo-updated', handleTodoUpdated)
    }
  }, [])

  const handleStorageChange = (e) => {
    if (e.key === 'categories') {
      loadCategories()
    }
  }

  const handleTodoUpdated = () => {
    loadCategories()
  }

  const loadCategories = () => {
    const allCategories = getAllCategories()
    setCategories(allCategories)
  }

  const handleEdit = (todo) => {
    setEditingId(todo.id)
    setIsSheetOpen(true)
  }

  const handleSave = (updates) => {
    onUpdate(editingId, updates)
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

  // 排序函数
  const sortTodos = (todos) => {
    return [...todos].sort((a, b) => {
      // 首先按截止时间排序
      if (a.dueDate && b.dueDate) {
        const dateCompare = new Date(b.dueDate) - new Date(a.dueDate)
        if (dateCompare !== 0) return dateCompare
      } else if (a.dueDate) return -1
      else if (b.dueDate) return 1

      // 其次按提醒时间排序
      if (a.reminderTime && b.reminderTime) {
        const reminderCompare = new Date(b.reminderTime) - new Date(a.reminderTime)
        if (reminderCompare !== 0) return reminderCompare
      } else if (a.reminderTime) return -1
      else if (b.reminderTime) return 1

      // 最后按创建时间排序
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }

  const getTimelineTime = (todo) => {
    return todo.dueDate || todo.reminderTime || todo.createdAt
  }

  // 分组
  const groupTodosByDay = (todos) => {
    const groups = {}
    todos.forEach(todo => {
      const time = getTimelineTime(todo)
      const day = format(new Date(time), 'yyyy-MM-dd')
      if (!groups[day]) groups[day] = []
      groups[day].push(todo)
    })
    return groups
  }

  const sortedTodos = sortTodos(todos)
  const grouped = groupTodosByDay(sortedTodos)
  const days = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a))

  if (todos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">暂无待办事项</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 relative">
        {days.map(day => (
          <div key={day}>
            {/* 日期标题 */}
            <div className="mb-2 text-sm text-gray-500 font-semibold pl-6">
              {format(new Date(day), 'MM-dd EEE', { locale: zhCN })}
            </div>
            {grouped[day].map((todo, idx) => (
              <div key={todo.id} className="flex items-start relative">
                {/* 时间轴 */}
                <div className="flex flex-col items-center mr-3">
                  {/* 只有第一个才显示圆点 */}
                  {idx === 0 ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  ) : (
                    <div className="w-1.5 h-1.5" /> // 占位，保证对齐
                  )}
                  {/* 竖线（不是最后一个才显示） */}
                  {idx !== grouped[day].length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200" style={{ minHeight: 32 }} />
                  )}
                </div>
                {/* 卡片 */}
                <div className="flex-1">
                  <TodoCard
                    todo={todo}
                    onToggleStatus={onToggleStatus}
                    onStar={handleStar}
                    onEdit={handleEdit}
                    getCategoryName={getCategoryName}
                    categories={categories}
                  />
                </div>
                {/* 时间文本 */}
                <div className="absolute left-7 top-0 text-xs text-gray-400 select-none">
                  {format(new Date(getTimelineTime(todo)), 'HH:mm')}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <TodoEditSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        todo={todos.find(t => t.id === editingId)}
        categories={categories}
        onSave={handleSave}
        onDelete={() => {
          onDelete(editingId)
          setIsSheetOpen(false)
        }}
        onCancel={handleCancel}
      />
    </>
  )
} 