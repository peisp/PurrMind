import * as React from "react"
import {
  CircleCheckBig,
  Inbox, LayoutList, LucideCalendar1,
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

// This is sample data.
const data = {
  navMain: [
    { title: "今天", url: "#", icon: LucideCalendar1, },
    { title: "计划", url: "#", icon: LayoutList, isActive: true, },
    { title: "全部", url: "#", icon: Inbox, },
    { title: "收藏", url: "#", icon: StarsIcon, },
    { title: "已完成", url: "#", icon: CircleCheckBig, },
  ],
  myList: [
    { name: "提醒事项", url: "#", emoji: "⏰", },
    { name: "工作任务", url: "#", emoji: "💼", },
    { name: "生活任务", url: "#", emoji: "💪", },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavMyList lists={data.myList} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
