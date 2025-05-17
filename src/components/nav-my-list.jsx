import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  StarOff,
  Trash2,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'
import { getAllCategories } from '@/db/todo'

export function NavMyList({
  lists,
  onCategoryChange,
  currentCategory
}) {
  const { isMobile } = useSidebar()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const allCategories = getAllCategories()
    setCategories(allCategories)
  }, [])

  const handleClick = (category) => {
    onCategoryChange(category)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>我的列表</SidebarGroupLabel>
      <SidebarMenu>
        {lists.map((item) => (
          <SidebarMenuItem key={`list-${item.name}`}>
            <SidebarMenuButton 
              asChild
              className={cn(
                "w-full justify-start gap-2",
                currentCategory === item.name && "bg-muted"
              )}
              onClick={() => handleClick(item.name)}
            >
              <a href={item.url} title={item.name}>
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}>
                <DropdownMenuItem>
                  <StarOff className="text-muted-foreground" />
                  <span>Remove from Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link className="text-muted-foreground" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowUpRight className="text-muted-foreground" />
                  <span>Open in New Tab</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {categories.map((category) => (
          <SidebarMenuItem key={`category-${category}`}>
            <SidebarMenuButton 
              className={cn(
                "w-full justify-start gap-2",
                currentCategory === category && "bg-muted"
              )}
              onClick={() => handleClick(category)}
            >
              <span className="text-lg">📁</span>
              {category}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem key="more">
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
