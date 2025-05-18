import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
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

export function TodoList({ todos, onUpdate, onDelete, onToggleStatus }) {
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '' })
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
      description: todo.description
    })
    setIsSheetOpen(true)
  }

  const handleSave = (id) => {
    onUpdate(id, editForm)
    setEditingId(null)
    setIsSheetOpen(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsSheetOpen(false)
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
    <>
      <div className="space-y-4">
        {todos.map((todo) => (
          <Card key={todo.id} className="p-4">
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
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={() => handleSave(editingId)}>
              保存
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
} 