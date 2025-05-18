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
        {/* 七彩流动边框和光晕 */}
        {isAIActive && (
          <div
            className="
              absolute inset-0 z-0 rounded-lg pointer-events-none
              before:content-[''] before:absolute before:inset-0 before:rounded-lg
              before:bg-gradient-to-r before:from-red-500 before:via-yellow-500 before:via-green-500 before:via-blue-500 before:via-indigo-500 before:via-purple-500 before:to-red-500
              before:blur-[12px] before:opacity-40 before:animate-gradient-x
            "
          />
        )}
        <div className={cn(
          "relative rounded-lg z-10 p-[2px]",
          isAIActive
            ? "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 via-purple-500 to-red-500 animate-gradient-x"
            : "bg-transparent"
        )}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="添加任务..."
            className={cn(
              "h-12 text-lg pl-10 pr-10 transition-all duration-200 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              isAIActive && "bg-background"
            )}
          />
        </div>
        {/* 左侧的 Plus 图标 */}
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-20" />
        {/* 右侧的 Sparkles 图标 */}
        <Sparkles 
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer transition-colors duration-200 z-20",
            isAIActive ? "text-purple-500" : "text-muted-foreground"
          )}
          onClick={toggleAI}
        />
      </div>
    </form>
  )
} 