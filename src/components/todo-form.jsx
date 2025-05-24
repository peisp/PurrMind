import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Plus, Sparkles } from 'lucide-react'
import { getAllCategories } from '@/db/todo'
import { cn } from '@/lib/utils'
import { getTaskObjByAi } from '@/components/ai/ai-utools.js'

export function TodoForm ({ onAdd, defaultCategory, defaultStarred, defaultDueDate }) {
  const [title, setTitle] = useState('')
  const [isAIActive, setIsAIActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showAiTip, setShowAiTip] = useState(false)

  // 创建基础任务对象
  const createBaseTask = (taskTitle) => ({
    title: taskTitle.trim(),
    description: '',
    dueDate: defaultDueDate || null,
    completed: false,
    starred: defaultStarred || false,
    categoryId: defaultCategory || null
  })

  // 处理AI任务创建
  const handleAITaskCreation = async (taskTitle) => {
    try {
      const tasks = await getTaskObjByAi(null, taskTitle)
      if (!tasks || tasks.length === 0) {
        throw new Error('AI未能生成有效的任务')
      }
      
      tasks.forEach(task => {
        const todoNew = {
          ...createBaseTask(taskTitle),
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          reminderTime: task.reminderTime
        }
        onAdd(todoNew)
      })
    } catch (err) {
      setError(err.message || 'AI任务处理失败')
      throw err
    }
  }

  // 处理普通任务创建
  const handleNormalTaskCreation = (taskTitle) => {
    const todoNew = createBaseTask(taskTitle)
    onAdd(todoNew)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    // 验证输入
    if (!title.trim()) {
      setError('任务标题不能为空')
      return
    }

    // 防止重复提交
    if (isSubmitting || isProcessing) {
      return
    }

    setIsSubmitting(true)
    try {
      if (isAIActive) {
        setIsProcessing(true)
        await handleAITaskCreation(title)
      } else {
        handleNormalTaskCreation(title)
      }
      setTitle('')
    } catch (err) {
      console.error('任务创建失败:', err)
    } finally {
      setIsProcessing(false)
      setIsSubmitting(false)
    }
  }

  const toggleAI = () => {
    if (!isAIActive) {
      setShowAiTip(true)
      setTimeout(() => setShowAiTip(false), 2000)
    }
    setIsAIActive(!isAIActive)
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <div className="relative w-full">
        {/* AI能量提示 */}
        {showAiTip && (
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-14 flex items-center gap-2 px-5 py-2 rounded-xl shadow-lg z-50
              bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 text-white font-semibold text-base
              animate-fade-in-out"
            style={{
              pointerEvents: 'none',
              opacity: showAiTip ? 1 : 0,
              transition: 'opacity 0.5s'
            }}
          >
            <Sparkles className="w-5 h-5 text-white drop-shadow" />
            每次消耗1点 uTools AI能量
          </div>
        )}
        
        {/* 错误提示 */}
        {error && (
          <div className="absolute -top-6 left-0 text-sm text-red-500">
            {error}
          </div>
        )}
        
        {/* 七彩流动边框和光晕 */}
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
            onChange={(e) => {
              setTitle(e.target.value)
              setError(null)
            }}
            placeholder="添加任务..."
            disabled={isSubmitting || isProcessing}
            className={cn(
              'h-12 text-lg pl-10 pr-10 transition-all duration-200 focus:ring-0 ',
              isAIActive && 'bg-background',
              (isSubmitting || isProcessing) && 'opacity-70 cursor-not-allowed'
            )}
          />
        </div>
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-20"/>
        <Sparkles
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer transition-colors duration-200 z-20',
            isAIActive ? 'text-purple-800' : 'text-muted-foreground',
            (isSubmitting || isProcessing) && 'cursor-not-allowed opacity-70'
          )}
          onClick={toggleAI}
        />
      </div>
    </form>
  )
}