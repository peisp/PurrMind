import { useState, useEffect } from 'react'
import { AlertCircle, Plus, Sparkles, Cpu, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTaskObjByAi } from '@/components/ai/ai-utools'
import { Input } from '@/components/ui/input'

export function TodoForm({
  onAdd,
  defaultCategory,
  defaultStarred,
  defaultDueDate
}) {
  const [title, setTitle] = useState('')
  const [isAIActive, setIsAIActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showAiTip, setShowAiTip] = useState(false)
  const [streamContent, setStreamContent] = useState('')

  // 优化滚动效果 - 使用useEffect但减少不必要的重复计算
  useEffect(() => {
    if (isProcessing && streamContent) {
      // 使用setTimeout确保DOM更新后再滚动
      setTimeout(() => {
        const scrollContainer = document.querySelector('.stream-container')
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 0)
    }
  }, [streamContent, isProcessing])

  // 获取当前AI模型设置
  const getAIModelSetting = () => {
    const settings = window.utools?.dbStorage?.getItem('purrmind_settings')
    return (
      settings?.aiSetting || {
        model: 'deepseek-v3',
        icon: 'sparkles',
        cost: 1,
        custom: false
      }
    )
  }

  // 创建基础任务对象
  const createBaseTask = taskTitle => ({
    title: taskTitle.trim(),
    description: '',
    dueDate: defaultDueDate || null,
    completed: false,
    starred: defaultStarred || false,
    categoryId: defaultCategory || null
  })

  // 处理AI任务创建
  const handleAITaskCreation = async taskTitle => {
    try {
      let fullContent = ''
      setTitle(' ') // 清空输入框,空字符替换placeholder
      const tasks = await new Promise((resolve, reject) => {
        getTaskObjByAi(taskTitle, chunk => {
          if (chunk.content || chunk.reasoning_content) {
            fullContent += chunk.reasoning_content
              ? chunk.reasoning_content
              : chunk.content
            setStreamContent(fullContent)
          }
        })
          .then(resolve)
          .catch(reject)
      })

      if (!tasks || tasks.length === 0) {
        throw new Error('AI未能生成有效的任务')
      }

      tasks.forEach(task => {
        const todoNew = {
          ...createBaseTask(taskTitle),
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          reminderTime: task.reminderTime,
          recurrence: task.recurrence || null
        }
        onAdd(todoNew)
      })
    } catch (err) {
      setError(err.message || 'AI任务处理失败')
      throw err
    }
  }

  // 处理普通任务创建
  const handleNormalTaskCreation = taskTitle => {
    const todoNew = createBaseTask(taskTitle)
    onAdd(todoNew)
  }

  const handleSubmit = async e => {
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
      setTimeout(() => setShowAiTip(false), 3000) // 延长显示时间
    }
    setIsAIActive(!isAIActive)
    setError(null)
  }

  // 获取当前模型设置用于显示
  const currentModelSetting = getAIModelSetting()

  return (
    <form onSubmit={handleSubmit} className='flex items-center w-full'>
      <div className='relative w-full'>
        {/* AI模型计费提示 */}
        {showAiTip && (
          <div
            className='absolute left-1/2 -translate-x-1/2 -top-16 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg z-50
              bg-gradient-to-r text-white font-medium text-sm animate-fade-in-out'
            style={{
              pointerEvents: 'none',
              opacity: showAiTip ? 1 : 0,
              transition: 'opacity 0.5s',
              background: currentModelSetting.custom
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
            }}
          >
            {currentModelSetting.custom
              ? (
              <>
                <Cpu className='w-4 h-4 text-white drop-shadow' />
                <span>自定义模型 - 按token计费</span>
              </>
                )
              : (
              <>
                <Coins className='w-4 h-4 text-white drop-shadow' />
                <span>消耗 {currentModelSetting.cost} 点uTools AI能量</span>
              </>
                )}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className='absolute -top-8 left-0.5 flex items-center text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg shadow'>
            <AlertCircle className='w-4 h-4 mr-1.5' />
            {error}
          </div>
        )}

        {/* 七彩流动边框和光晕 */}
        <div
          className={cn(
            'absolute inset-0 z-30 rounded-lg pointer-events-none transition-opacity duration-300',
            isAIActive && isProcessing ? 'opacity-100' : 'opacity-0'
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

        <div
          className={cn(
            'relative rounded-lg z-10 p-[2px] transition-all duration-300',
            isAIActive
              ? 'bg-gradient-to-r from-red-300 via-yellow-300 via-green-300 via-blue-300 via-indigo-300 via-purple-300 to-red-300 animate-gradient-x'
              : 'bg-transparent'
          )}
        >
          <div className='relative'>
            <Input
              value={title}
              onChange={e => {
                if (!isProcessing) {
                  setTitle(e.target.value)
                  setError(null)
                }
              }}
              placeholder='添加任务...'
              disabled={isSubmitting || isProcessing}
              className={cn(
                'h-12 text-lg pl-10 pr-10 transition-all duration-200 focus:ring-0',
                isAIActive && 'bg-background',
                (isSubmitting || isProcessing) &&
                  'opacity-70 cursor-not-allowed',
                isProcessing && 'animate-pulse'
              )}
            />
            {isProcessing && (
              <div className='absolute inset-0 overflow-y-auto scroll-smooth pl-10 pr-20 py-4 stream-container z-20 [&::-webkit-scrollbar]:hidden'>
                <pre className='text-sm whitespace-pre-wrap text-gray-500'>
                  {streamContent}
                </pre>
              </div>
            )}
          </div>
        </div>
        <Plus className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-20' />
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
