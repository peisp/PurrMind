import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addTodo } from '@/db/todo'
import { getAllCategories } from '@/db/todo'

export function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const loadCategories = () => {
      const allCategories = getAllCategories()
      setCategories(allCategories)
    }
    loadCategories()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const newTodo = addTodo({
      title: title.trim(),
      description: description.trim(),
      categoryId
    })

    setTitle('')
    setDescription('')
    setCategoryId(null)
    onAdd(newTodo)
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="添加新任务..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="添加描述（可选）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>无分类</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">
          添加任务
        </Button>
      </form>
    </Card>
  )
} 