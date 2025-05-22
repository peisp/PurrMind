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

  const sortTodos = (todos) => {
    return [...todos].sort((a, b) => {
      // 优先按是否完成：未完成的排前面
      if (a.completedAt && !b.completedAt) return 1
      if (!a.completedAt && b.completedAt) return -1

      const isCompleted = !!a.completedAt && !!b.completedAt

      if (!isCompleted) {
        // 对未完成任务：按截止时间升序
        if (a.dueDate && b.dueDate) {
          const dateCompare = new Date(a.dueDate) - new Date(b.dueDate)
          if (dateCompare !== 0) return dateCompare
        } else if (a.dueDate) return -1
        else if (b.dueDate) return 1

        // 按提醒时间升序
        if (a.reminderTime && b.reminderTime) {
          const reminderCompare = new Date(a.reminderTime) - new Date(b.reminderTime)
          if (reminderCompare !== 0) return reminderCompare
        } else if (a.reminderTime) return -1
        else if (b.reminderTime) return 1

        // 按创建时间升序
        return new Date(a.createdAt) - new Date(b.createdAt)
      } else {
        // 对已完成任务：按完成时间降序
        return new Date(b.completedAt) - new Date(a.completedAt)
      }
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
      <div className="relative">
        {/* 主时间轴线 */}
        <div className="absolute left-0.5 top-1.5 bottom-0 w-0.5 bg-gray-200 mt-4" />

        {days.map((day, dayIndex) => (
          <div key={day}>
            <div className="flex items-start relative">
              {/* 时间轴节点 */}
              <div className="flex items-center mr-3 mt-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>

              {/* 右侧内容区域 */}
              <div className="flex-1">
                {/* 日期标题 */}
                <div className="my-2 text-sm text-primary font-semibold">
                  {format(new Date(day), 'MM-dd EEE', { locale: zhCN })}
                </div>

                {/* 待办事项卡片 */}
                <div className="space-y-2">
                  {grouped[day].map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onToggleStatus={onToggleStatus}
                      onStar={handleStar}
                      onEdit={handleEdit}
                      getCategoryName={getCategoryName}
                      categories={categories}
                    />
                  ))}
                </div>
              </div>
            </div>
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