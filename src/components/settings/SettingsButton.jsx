import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsPanel } from './SettingsPanel'
import { cn } from "@/lib/utils"

export function SettingsButton() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full transition-all duration-300 hover:scale-110",
          settingsOpen
            ? "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 shadow-inner text-purple-600"
            : "text-muted-foreground hover:text-primary"
        )}
        onClick={(e) => {
          e.stopPropagation()
          setSettingsOpen(true)
        }}
      >
        <Settings className="h-5 w-5" />
      </Button>
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen}/>
    </>
  )
}
