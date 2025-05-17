import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAllCategories } from '@/db/todo'

export function TodoForm({ onAdd }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'default'
  })
  const [categories, setCategories] = useState(['default'])

  useEffect(() => {
    const allCategories = getAllCategories()
    const filteredCategories = allCategories.filter(category => category !== 'default')
    setCategories(['default', ...filteredCategories])
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    onAdd(form)
    setForm({
      title: '',
      description: '',
      category: 'default'
    })
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="输入待办事项标题"
          required
        />
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="输入待办事项描述（可选）"
        />
        <div className="flex items-center gap-4">
          <Select
            value={form.category}
            onValueChange={(value) => setForm({ ...form, category: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'default' ? '默认分类' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">添加</Button>
        </div>
      </form>
    </Card>
  )
} 