import { NavMyList } from '@/components/sidebar/nav-my-list.jsx'
import { NavMain } from '@/components/sidebar/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'

import { SettingsButton } from '@/components/settings/SettingsButton'

export function AppSidebar({
  onFilterChange,
  onCategoryChange,
  currentFilter,
  currentCategory,
  ...props
}) {
  return (
    <Sidebar
      className='shadow-lg border-t bg-gradient-to-b from-background to-accent/20 transition-all duration-300'
      {...props}
    >
      <SidebarHeader className='p-3'>
        <NavMain
          onFilterChange={onFilterChange}
          currentFilter={currentFilter}
        />
      </SidebarHeader>
      <SidebarContent className='px-2'>
        <NavMyList
          onCategoryChange={onCategoryChange}
          currentCategory={currentCategory}
        />
      </SidebarContent>
      <SidebarFooter className='p-3 pb-0'>
        <SettingsButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
