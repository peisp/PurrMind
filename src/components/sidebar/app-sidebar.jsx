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

export function AppSidebar({
  onFilterChange,
  onCategoryChange,
  currentFilter,
  currentCategory,
  ...props
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
          <NavMain
          onFilterChange={onFilterChange}
          currentFilter={currentFilter}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMyList
          onCategoryChange={onCategoryChange}
          currentCategory={currentCategory}
        />
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={(e) => {
            e.stopPropagation()
            setSettingsOpen(true)
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </SidebarFooter>
      <SidebarRail />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen}/>
    </Sidebar>
  )
}
