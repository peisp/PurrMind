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

const data = {
  navMain: [
    { id: "today", title: "今天", icon: LucideCalendar1 },
    { id: "planned", title: "计划", icon: LayoutList },
    { id: "all", title: "全部", icon: Inbox },
    { id: "starred", title: "收藏", icon: StarsIcon },
    { id: "completed", title: "已完成", icon: CircleCheckBig },
  ],
  // myList: [
  //   { name: "提醒事项", emoji: "⏰" },
  //   { name: "工作任务", emoji: "💼" },
  //   { name: "生活任务", emoji: "💪" },
  // ],
}

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
          items={data.navMain} 
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
