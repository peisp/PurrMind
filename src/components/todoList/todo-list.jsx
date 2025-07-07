import { useState, useEffect, useCallback } from 'react'
import { getAllCategories } from '@/db/todo'
import { TodoEditSheet } from './editCard/TodoEditSheet'
import { CalendarView } from './CalendarView'
import { TimelineView } from './TimelineView'

export function TodoList({
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

  // 数据加载函数 - 使用useCallback优化
  const loadCategories = useCallback(() => {
    const allCategories = getAllCategories()
    setCategories(allCategories)
  }, [])

  // 初始化加载
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // 外部事件监听 - 分离事件监听逻辑
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'categories') {
        loadCategories()
      }
    }

    const handleTodoUpdated = () => {
      loadCategories()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('todo-updated', handleTodoUpdated)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('todo-updated', handleTodoUpdated)
    }
  }, [loadCategories])

  const handleEdit = useCallback((todo) => {
    setEditingId(todo.id)
    setIsSheetOpen(true)
  }, [])

  const handleSave = useCallback((updates) => {
    onUpdate(editingId, updates)
    setEditingId(null)
    setIsSheetOpen(false)
  }, [editingId, onUpdate])

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setIsSheetOpen(false)
  }, [])

  const handleStar = useCallback((e, todo) => {
    e.stopPropagation()
    onUpdate(todo.id, { ...todo, starred: !todo.starred })
  }, [onUpdate])

  const getCategoryName = useCallback((categoryId) => {
    if (!categoryId) return '无分类'
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : '未知分类'
  }, [categories])

  const handleDelete = useCallback(() => {
    onDelete(editingId)
    setIsSheetOpen(false)
  }, [editingId, onDelete])

  if (todos.length === 0) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-muted-foreground'>暂无待办事项</p>
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
          onDelete={handleDelete}
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
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    </>
  )
}
