import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SettingsPanel({ open, onOpenChange }) {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    defaultDueTime: '18:00',
    aiSetting: {
      model: 'gpt-3.5-turbo',
      icon: 'sparkles',
      cost: 1
    }
  })
  const [aiModels, setAiModels] = useState([])

  useEffect(() => {
    // 加载保存的设置
    const savedSettings = window.utools.dbStorage.getItem('purrmind_settings') || {}
    setSettings(prev => ({ ...prev, ...savedSettings }))
    // 异步获取可用AI模型
    if (window.utools?.allAiModels) {
      window.utools.allAiModels()
        .then(models => setAiModels(models))
        .catch(err => console.error('获取AI模型失败:', err))
    }
  }, [])

  const handleChange = (key, value) => {
    let newSettings = { ...settings }
    console.log("key:",key)
    if (key === 'aiModel') {
      const selectedModel = aiModels.find(model => model.id === value)
      if (selectedModel) {
        newSettings = {
          ...newSettings,
          aiSetting: {
            model: value,
            icon: selectedModel.icon || 'sparkles',
            cost: selectedModel.cost || 1
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="col-span-1">
            <Label htmlFor="dark-mode">深色模式</Label>
            </div>
            <div className="col-span-3">
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(val) => handleChange('darkMode', val)}
                className="justify-self-end"
              />
            </div>

            <div className="col-span-1">
              <Label htmlFor="notifications">通知提醒</Label>
            </div>
            <div className="col-span-3">
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(val) => handleChange('notifications', val)}
                className="justify-self-end"
              />
            </div>

            <div className="col-span-1">
              <Label htmlFor="default-time">默认截止时间</Label>
            </div>
            <div className="col-span-3">
              <Input
                id="default-time"
                type="time"
                value={settings.defaultDueTime}
                onChange={(e) => handleChange('defaultDueTime', e.target.value)}
                className="w-full"
              />
            </div>

            {aiModels.length > 0 && (
              <>
                <div className="col-span-1">
                  <Label>默认AI模型</Label>
                </div>
                <div className="col-span-3">
                  <Select
                    value={settings.aiSetting.model}
                    onValueChange={(val) => handleChange('aiModel', val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择AI模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            {model.icon && <img src={model.icon} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />}
                            <span>{model.label} (消耗: {model.cost}点)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
