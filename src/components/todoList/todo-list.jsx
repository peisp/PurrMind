import { useState, useEffect } from 'react'
import { getAllCategories } from '@/db/todo'
import { TodoCard } from './todo-card'
import { TodoEditSheet } from './todo-edit-sheet'
import { format } from 'date-fns'
import { DayLabel } from '@/components/todoList/day-label'
import { CalendarView } from './CalendarView'
import { TimelineView } from './TimelineView'

export function TodoList ({
  todos,
  onUpdate,
  onDelete,
  onToggleStatus,
  viewMode = 'timeline',
  calendarCurrentDate,
  calendarViewMode = 'month'
}) {
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
    if (!categoryId) return '无分类'
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : '未知分类'
  }

  if (todos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">暂无待办事项</p>
      </div>
    )
  }

  if (viewMode === 'calendar') {
    return (
      <>
        <CalendarView
          todos={todos}
          currentDate={calendarCurrentDate}
          viewMode={calendarViewMode}
          onToggleStatus={onToggleStatus}
          onEdit={handleEdit}
        />
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

  return (
    <>
      <TimelineView
        todos={todos}
        onToggleStatus={onToggleStatus}
        onStar={handleStar}
        onEdit={handleEdit}
        getCategoryName={getCategoryName}
        categories={categories}
      />
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
