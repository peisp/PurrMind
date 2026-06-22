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
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AppSidebar({
  onFilterChange,
  onCategoryChange,
  currentFilter,
  currentCategory,
  ...props
}) {
  const openGitHub = () => {
    // eslint-disable-next-line no-undef
    utools.shellOpenExternal('https://github.com/peisp/PurrMind')
  }

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
        <div className='flex w-full items-center justify-between'>
          <SettingsButton />
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 rounded-full text-muted-foreground hover:text-primary'
            onClick={openGitHub}
          >
            <Github className='h-4 w-4' />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
