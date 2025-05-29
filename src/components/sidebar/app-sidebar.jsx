import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavMyList } from "@/components/sidebar/nav-my-list.jsx"
import { NavMain } from "@/components/sidebar/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { cn } from "@/lib/utils"

export function AppSidebar({
  onFilterChange,
  onCategoryChange,
  currentFilter,
  currentCategory,
  ...props
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <Sidebar 
      className="shadow-lg rounded-r-xl border-0 bg-gradient-to-b from-background to-accent/20 transition-all duration-300"
      {...props}
    >
      <SidebarHeader className="p-3">
        <NavMain
          onFilterChange={onFilterChange}
          currentFilter={currentFilter}
        />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMyList
          onCategoryChange={onCategoryChange}
          currentCategory={currentCategory}
        />
      </SidebarContent>
      <SidebarFooter className="p-3">
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
      </SidebarFooter>
      <SidebarRail />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen}/>
    </Sidebar>
  )
}
