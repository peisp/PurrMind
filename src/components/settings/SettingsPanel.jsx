import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

export function SettingsPanel({ open, onOpenChange }) {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    defaultDueTime: '18:00'
  })

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">深色模式</Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(val) => handleChange('darkMode', val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">通知提醒</Label>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(val) => handleChange('notifications', val)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-time">默认截止时间</Label>
            <Input
              id="default-time"
              type="time"
              value={settings.defaultDueTime}
              onChange={(e) => handleChange('defaultDueTime', e.target.value)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
