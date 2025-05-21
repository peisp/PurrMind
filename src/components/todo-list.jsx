import { useState, useEffect } from 'react'
import { getAllCategories } from "@/db/todo"
import { TodoCard } from './todo-card'
import { TodoEditSheet } from './todo-edit-sheet'

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

  if (todos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">暂无待办事项</p>
      </div>
    )
  }

  const sortedTodos = sortTodos(todos)

  return (
    <>
      <div className="space-y-1">
        {sortedTodos.map((todo) => (
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