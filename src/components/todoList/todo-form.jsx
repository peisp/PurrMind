import React, { useState, useEffect } from 'react'
import { Plus, Sparkles, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTaskObjByAi } from '@/components/ai/ai-utools'
import { Input } from '@/components/ui/input'

export function TodoForm ({ onAdd, defaultCategory, defaultStarred, defaultDueDate }) {
  const [title, setTitle] = useState('')
  const [isAIActive, setIsAIActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showAiTip, setShowAiTip] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  
  useEffect(() => {
    if (isProcessing && streamContent) {
      const scrollContainer = document.querySelector('.stream-container')
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }, [streamContent, isProcessing])

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
      let fullContent = '';
      setTitle(' '); // 清空输入框,空字符替换placeholder
      const tasks = await new Promise((resolve, reject) => {
        getTaskObjByAi(taskTitle, (chunk) => {
          if (chunk.content || chunk.reasoning_content) {
            fullContent += chunk.reasoning_content ? chunk.reasoning_content : chunk.content;
            setStreamContent(fullContent);
          }
        }).then(resolve).catch(reject);
      });

      if (!tasks || tasks.length === 0) {
        throw new Error('AI未能生成有效的任务');
      }

      tasks.forEach(task => {
        const todoNew = {
          ...createBaseTask(taskTitle),
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          reminderTime: task.reminderTime
        };
        onAdd(todoNew);
      });
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
            className="absolute left-1/2 -translate-x-1/2 -top-14 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg z-50
              bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium text-sm
              animate-fade-in-out"
            style={{
              pointerEvents: 'none',
              opacity: showAiTip ? 1 : 0,
              transition: 'opacity 0.3s ease-out'
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            每次消耗 1 点 uTools AI能量
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="absolute -bottom-7 left-0 flex items-center text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg shadow">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            {error}
          </div>
        )}

        <div className={cn(
          'relative rounded-xl z-10 p-[2px] transition-all duration-300 shadow-md',
          isAIActive
            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-purple-500/20'
            : 'bg-transparent shadow-transparent'
        )}>
          <div className="relative bg-background rounded-xl overflow-hidden">
            <Input
              value={title}
              onChange={(e) => {
                if (!isProcessing) {
                  setTitle(e.target.value);
                  setError(null);
                }
              }}
              placeholder="添加任务..."
              disabled={isSubmitting || isProcessing}
              className={cn(
                'h-12 text-base pl-12 pr-12 transition-all duration-200 focus:ring-0 border-0',
                (isSubmitting || isProcessing) && 'opacity-80 cursor-not-allowed',
                isProcessing && 'animate-pulse'
              )}
            />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>
        </div>
        
        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-20 hover:text-primary transition-colors"/>
        <Sparkles
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer transition-all duration-200 z-20 hover:scale-110',
            isAIActive ? 'text-purple-600' : 'text-muted-foreground',
            (isSubmitting || isProcessing) && 'cursor-not-allowed opacity-70'
          )}
          onClick={toggleAI}
        />
        
        {isProcessing && streamContent && (
          <div className="absolute top-full mt-2 w-full max-h-40 overflow-y-auto bg-background border rounded-lg shadow-lg p-3 text-sm text-muted-foreground z-30">
            <pre className="whitespace-pre-wrap">{streamContent}</pre>
          </div>
        )}
      </div>
    </form>
  )
}
