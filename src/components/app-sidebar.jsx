import * as React from "react"
import {
  CircleCheckBig,
  Inbox,
  LayoutList,
  LucideCalendar1,
  StarsIcon,
} from 'lucide-react'
import { NavMyList } from "@/components/nav-my-list.jsx"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({
  onFilterChange,
  onCategoryChange,
  currentFilter,
  currentCategory,
  ...props
}) {
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
      <SidebarRail />
    </Sidebar>
  )
}
