import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getAllCategories } from "@/db/todo"

export function TodoList({ todos, onUpdate, onDelete, onToggleStatus }) {
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '' })

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
      description: todo.description
    })
  }

  const handleSave = (id) => {
    onUpdate(id, editForm)
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "无分类"
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : "未知分类"
  }

  if (todos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">暂无待办事项</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <Card key={todo.id} className="p-4">
          {editingId === todo.id ? (
            <div className="space-y-4">
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="标题"
              />
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="描述"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  取消
                </Button>
                <Button onClick={() => handleSave(todo.id)}>
                  保存
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => onToggleStatus(todo.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={`mt-1 text-sm text-muted-foreground ${todo.completed ? 'line-through' : ''}`}>
                    {todo.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {getCategoryName(todo.categoryId)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(todo)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(todo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
} 