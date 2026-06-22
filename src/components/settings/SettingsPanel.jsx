import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Info,
  Sparkles,
  Send,
  CheckCircle,
  XCircle,
  Cpu,
  Coins,
  Download
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { barkService } from '@/services/bark'
import { getAllTodos, getAllCategories } from '@/db/todo'

export function SettingsPanel({ open, onOpenChange }) {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    defaultDueTime: '18:00',
    aiSetting: {
      model: 'deepseek-chat',
      icon: 'sparkles',
      cost: 1
    }
  })
  const [aiModels, setAiModels] = useState([])
  const [barkSettings, setBarkSettings] = useState({
    enabled: false,
    apiUrl: 'https://api.day.app',
    token: ''
  })
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  // 分离内置模型和自定义模型
  const builtInModels = aiModels.filter(model => !model.custom)
  const customModels = aiModels.filter(model => model.custom)

  // 初始化设置 - 加载本地数据和异步获取AI模型
  useEffect(() => {
    // 同步加载本地设置
    const savedSettings =
      window.utools.dbStorage.getItem('purrmind_settings') || {}
    setSettings(prev => ({ ...prev, ...savedSettings }))

    const savedBarkSettings = barkService.getSettings()
    setBarkSettings(savedBarkSettings)

    // 异步获取AI模型列表
    if (window.utools?.allAiModels) {
      window.utools
        .allAiModels()
        .then(models => {
          console.log('获取到的AI模型:', models)
          setAiModels(models)
        })
        .catch(err => console.error('获取AI模型失败:', err))
    }
  }, [])

  const handleChange = (key, value) => {
    let newSettings = { ...settings }
    // console.log('key:', key)
    if (key === 'aiModel') {
      const selectedModel = aiModels.find(model => model.id === value)
      if (selectedModel) {
        newSettings = {
          ...newSettings,
          aiSetting: {
            model: value,
            icon: selectedModel.icon || 'sparkles',
            cost: selectedModel.cost || 1,
            custom: selectedModel.custom || false
          }
        }
      } else {
        newSettings = { ...newSettings, [key]: value }
      }
    } else {
      newSettings = { ...newSettings, [key]: value }
    }

    setSettings(newSettings)
    // 保存设置
    window.utools.dbStorage.setItem('purrmind_settings', newSettings)
    window.dispatchEvent(new Event('settings-updated'))
  }

  const handleBarkChange = (key, value) => {
    const newBarkSettings = { ...barkSettings, [key]: value }
    setBarkSettings(newBarkSettings)
    barkService.saveSettings(newBarkSettings)
    // 清除上次的测试结果
    setTestResult(null)
  }

  const handleExportMarkdown = () => {
    const todos = getAllTodos()
    const categories = getAllCategories()
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

    const formatDate = dateStr => {
      if (!dateStr) return null
      const d = new Date(dateStr)
      return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const pendingTodos = todos.filter(t => !t.completed)
    const completedTodos = todos.filter(t => t.completed)

    const renderTodo = todo => {
      const checkbox = todo.completed ? '[x]' : '[ ]'
      let line = `- ${checkbox} **${todo.title}**`
      const meta = []
      if (todo.dueDate) meta.push(`截止: ${formatDate(todo.dueDate)}`)
      if (todo.reminderTime) meta.push(`提醒: ${formatDate(todo.reminderTime)}`)
      if (todo.categoryId && categoryMap[todo.categoryId]) {
        meta.push(`分类: ${categoryMap[todo.categoryId]}`)
      }
      if (todo.starred) meta.push('⭐ 收藏')
      if (meta.length > 0) line += `  (${meta.join(' | ')})`
      if (todo.description) line += `\n  > ${todo.description}`
      return line
    }

    let md = '# 喵咚咚 - 待办事项导出\n\n'
    md += `> 导出时间: ${formatDate(new Date().toISOString())}\n\n`

    if (pendingTodos.length > 0) {
      md += `## 待办 (${pendingTodos.length})\n\n`
      md += pendingTodos.map(renderTodo).join('\n\n') + '\n\n'
    }

    if (completedTodos.length > 0) {
      md += `## 已完成 (${completedTodos.length})\n\n`
      md += completedTodos.map(renderTodo).join('\n\n') + '\n\n'
    }

    if (todos.length === 0) {
      md += '暂无待办事项。\n'
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `purrmind-export-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleTestBark = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const result = await barkService.testConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: '测试失败: ' + error.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='grid grid-cols-4 gap-4 items-center'>
            {/* <div className="col-span-1"> */}
            {/* <Label htmlFor="dark-mode">深色模式</Label> */}
            {/* </div> */}
            {/* <div className="col-span-3"> */}
            {/*  <Switch */}
            {/*    id="dark-mode" */}
            {/*    checked={settings.darkMode} */}
            {/*    onCheckedChange={(val) => handleChange('darkMode', val)} */}
            {/*    className="justify-self-end" */}
            {/*  /> */}
            {/* </div> */}

            {/* <div className="col-span-1"> */}
            {/*  <Label htmlFor="notifications">通知提醒</Label> */}
            {/* </div> */}
            {/* <div className="col-span-3"> */}
            {/*  <Switch */}
            {/*    id="notifications" */}
            {/*    checked={settings.notifications} */}
            {/*    onCheckedChange={(val) => handleChange('notifications', val)} */}
            {/*    className="justify-self-end" */}
            {/*  /> */}
            {/* </div> */}

            {/* <div className="col-span-1"> */}
            {/*  <Label htmlFor="default-time">默认截止时间</Label> */}
            {/* </div> */}
            {/* <div className="col-span-3"> */}
            {/*  <Input */}
            {/*    id="default-time" */}
            {/*    type="time" */}
            {/*    value={settings.defaultDueTime} */}
            {/*    onChange={(e) => handleChange('defaultDueTime', e.target.value)} */}
            {/*    className="w-full" */}
            {/*  /> */}
            {/* </div> */}

            {aiModels.length > 0 && (
              <>
                <div className='col-span-1 flex items-center justify-between'>
                  <Label>默认AI模型</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='text-muted-foreground cursor-help ml-auto'>
                        <Info className='w-4 h-4' />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='max-w-[300px]'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Sparkles className='w-4 h-4 text-violet-400' />
                          <span>内置模型 - 消耗uTools AI点数</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Cpu className='w-4 h-4 text-blue-400' />
                          <span>自定义模型 - 按token计费</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='col-span-3'>
                  <Select
                    value={settings.aiSetting.model}
                    onValueChange={val => handleChange('aiModel', val)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='选择AI模型' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* 自定义模型分组 - 放在前面 */}
                      {customModels.length > 0 && (
                        <>
                          <div className='px-2 py-1.5 text-sm font-medium text-muted-foreground bg-muted/50'>
                            <div className='flex items-center gap-2'>
                              <Cpu className='w-4 h-4 text-blue-400' />
                              <span>自定义模型</span>
                              <span className='text-xs text-blue-400 ml-1'>
                                - 按token计费
                              </span>
                            </div>
                          </div>
                          {customModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className='flex flex-row items-center gap-2'>
                                {model.icon && (
                                  <img
                                    src={model.icon}
                                    alt=''
                                    className='w-5 h-5 object-contain'
                                    onError={e =>
                                      (e.target.style.display = 'none')
                                    }
                                  />
                                )}
                                <span>{model.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}

                      {/* 内置模型分组 */}
                      {builtInModels.length > 0 && (
                        <>
                          {customModels.length > 0 && (
                            <div className='border-t border-border my-1'></div>
                          )}
                          <div className='px-2 py-1.5 text-sm font-medium text-muted-foreground bg-muted/50'>
                            <div className='flex items-center gap-2'>
                              <Sparkles className='w-4 h-4 text-violet-400' />
                              <span>内置模型</span>
                            </div>
                          </div>
                          {builtInModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className='flex flex-row items-center gap-2'>
                                {model.icon && (
                                  <img
                                    src={model.icon}
                                    alt=''
                                    className='w-5 h-5 object-contain'
                                    onError={e =>
                                      (e.target.style.display = 'none')
                                    }
                                  />
                                )}
                                <div className='flex items-center gap-1'>
                                  <span>{model.label}</span>
                                  <div className='flex items-center gap-1 ml-2'>
                                    <Coins className='w-4 h-4 text-violet-400' />
                                    <span className='text-sm text-violet-400'>
                                      {model.cost}点
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className='col-span-1 flex items-center'>
              <Label htmlFor='auto-ai'>自动开启AI</Label>
            </div>
            <div className='col-span-3 flex items-center'>
              <Switch
                id='auto-ai'
                checked={settings.autoAI || false}
                onCheckedChange={val => handleChange('autoAI', val)}
              />
            </div>

            {/* Bark推送设置 */}
            <div className='col-span-4'>
              <Separator className='my-4' />
            </div>
            <div className='col-span-1 flex items-center'>
              <Label htmlFor='bark-enabled'>Bark推送</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='text-muted-foreground cursor-help ml-auto'>
                    <Info className='w-4 h-4' />
                  </span>
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-[300px]'>
                  配置Bark推送服务，用于发送任务提醒到iOS设备。
                </TooltipContent>
              </Tooltip>
            </div>
            <div className='col-span-3 flex items-center justify-between'>
              <Switch
                id='bark-enabled'
                checked={barkSettings.enabled}
                onCheckedChange={val => handleBarkChange('enabled', val)}
              />
              <div className='flex items-center gap-2'>
                {testResult && (
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      testResult.success ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {testResult.success
                      ? (
                      <CheckCircle className='w-3 h-3' />
                        )
                      : (
                      <XCircle className='w-3 h-3' />
                        )}
                    <span>{testResult.success ? '成功' : '失败'}</span>
                  </div>
                )}
                <Button
                  onClick={handleTestBark}
                  disabled={
                    !barkSettings.enabled || !barkSettings.token || testing
                  }
                  variant='outline'
                  size='xs'
                  className='h-6 text-xs px-2'
                >
                  <Send className='w-3 h-3 mr-1' />
                  {testing ? '测试中' : '测试'}
                </Button>
              </div>
            </div>

            <div className='col-span-1'>
              <Label htmlFor='bark-api-url'>API地址</Label>
            </div>
            <div className='col-span-3'>
              <Input
                id='bark-api-url'
                type='url'
                placeholder='https://api.day.app'
                value={barkSettings.apiUrl}
                onChange={e => handleBarkChange('apiUrl', e.target.value)}
                disabled={!barkSettings.enabled}
              />
            </div>

            <div className='col-span-1'>
              <Label htmlFor='bark-token'>Token</Label>
            </div>
            <div className='col-span-3'>
              <Input
                id='bark-token'
                type='text'
                placeholder='输入您的Bark Token'
                value={barkSettings.token}
                onChange={e => handleBarkChange('token', e.target.value)}
                disabled={!barkSettings.enabled}
              />
            </div>

            {/* 数据导出 */}
            <div className='col-span-4'>
              <Separator className='my-4' />
            </div>
            <div className='col-span-1 flex items-center'>
              <Label>数据导出</Label>
            </div>
            <div className='col-span-3'>
              <Button
                onClick={handleExportMarkdown}
                variant='outline'
                size='sm'
                className='gap-2'
              >
                <Download className='w-4 h-4' />
                导出为 Markdown
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
