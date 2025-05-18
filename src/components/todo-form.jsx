import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Plus, Sparkles } from 'lucide-react'
import { getAllCategories } from '@/db/todo'
import { cn } from '@/lib/utils'

export function TodoForm ({ onAdd, defaultCategory, defaultStarred }) {
  const [title, setTitle] = useState('')
  const [isAIActive, setIsAIActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (title.trim()) {
      if (isAIActive && window.utools) {
        // 设置处理状态为真
        setIsProcessing(true)

        try {
          // 调用 uTools AI API
          // window.utools.hideMainWindowPasteText(title.trim())
          console.log('调用AI')
          // 使用 Promise 和 setTimeout 替代阻塞式的 sleep
          await new Promise(resolve => setTimeout(resolve, 10000))
        } finally {
          // 完成后设置处理状态为假
          setIsProcessing(false)
        }
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
        {/* 七彩流动边框和光晕 - 添加显示/隐藏的过渡动画 */}
        <div
          className={cn(
            'absolute inset-0 z-0 rounded-lg pointer-events-none transition-opacity duration-300',
            (isAIActive && isProcessing) ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div
            className="
              absolute inset-0 rounded-lg
              before:content-[''] before:absolute before:inset-0 before:rounded-lg
              before:bg-gradient-to-r before:from-red-800 before:via-yellow-800 before:via-green-800 before:via-blue-800 before:via-indigo-800 before:via-purple-800 before:to-red-800
              before:blur-[15px] before:opacity-80 before:animate-gradient-x animate-pulse
            "
          />


        </div>

        <div className={cn(
          'relative rounded-lg z-10 p-[2px] transition-all duration-300',
          isAIActive
            ? 'bg-gradient-to-r from-red-300 via-yellow-300 via-green-300 via-blue-300 via-indigo-300 via-purple-300 to-red-300 animate-gradient-x'
            : 'bg-transparent'
        )}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="添加任务..."
            className={cn(
              'h-12 text-lg pl-10 pr-10 transition-all duration-200 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              isAIActive && 'bg-background'
            )}
          />
        </div>
        {/* 左侧的 Plus 图标 */}
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-20"/>
        {/* 右侧的 Sparkles 图标 */}
        <Sparkles
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer transition-colors duration-200 z-20',
            isAIActive ? 'text-purple-800' : 'text-muted-foreground'
          )}
          onClick={toggleAI}
        />
      </div>
    </form>
  )
}