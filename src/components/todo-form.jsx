import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

export function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        description: '',
        dueDate: new Date().toISOString(),
        completed: false,
        starred: false
      })
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加任务..."
          className="h-12 text-lg pl-10"
        />
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>
    </form>
  )
} 