import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Plus, Sparkles } from 'lucide-react'
import { getAllCategories } from '@/db/todo'
import { cn } from '@/lib/utils'

export function TodoForm({ onAdd, defaultCategory, defaultStarred }) {
  const [title, setTitle] = useState('')
  const [isAIActive, setIsAIActive] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      if (isAIActive && window.utools) {
        // 调用 uTools AI API
        // window.utools.hideMainWindowPasteText(title.trim())
        console.log("调用AI")
      }
      onAdd({
        title: title.trim(),
        description: '',
        dueDate: new Date().toISOString(),
        completed: false,
        starred: defaultStarred || false,
        categoryId: defaultCategory || null
      })
      setTitle('')
    }
  }

  const toggleAI = () => {
    setIsAIActive(!isAIActive)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <div className="relative w-full">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加任务..."
          className={cn(
            "h-12 text-lg pl-10 pr-10 transition-all duration-200",
            isAIActive && "border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
          )}
        />
        {/* 左侧的 Plus 图标 */}
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        {/* 右侧的 Sparkles 图标 */}
        <Sparkles 
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer transition-colors duration-200",
            isAIActive ? "text-purple-500" : "text-muted-foreground"
          )}
          onClick={toggleAI}
        />
      </div>
    </form>
  )
} 