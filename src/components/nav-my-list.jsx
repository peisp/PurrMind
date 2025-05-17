import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  Plus,
  FolderIcon,
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
import { getAllCategories, getTodosByCategory, deleteCategory, addCategory } from '@/db/todo'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconPicker } from "./ui/icon-picker"
import * as Icons from "lucide-react"

export function NavMyList({
  onCategoryChange,
  currentCategory
}) {
  const { isMobile } = useSidebar()
  const [categories, setCategories] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState({ icon: "FolderIcon", color: "default" })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = () => {
    const allCategories = getAllCategories()
    setCategories(allCategories)
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = addCategory({
        name: newCategoryName.trim(),
        icon: selectedIcon.icon,
        color: selectedIcon.color
      })
      setCategories([...categories, newCategory])
      setNewCategoryName("")
      setSelectedIcon({ icon: "FolderIcon", color: "default" })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteCategory = (categoryId) => {
    deleteCategory(categoryId)
    loadCategories()
    if (currentCategory === categoryId) {
      onCategoryChange(null)
    }
  }

  const getCategoryCount = (categoryId) => {
    return getTodosByCategory(categoryId).length
  }

  const getIconColor = (color) => {
    switch (color) {
      case "red":
        return "text-red-500"
      case "orange":
        return "text-orange-500"
      case "yellow":
        return "text-yellow-500"
      case "green":
        return "text-green-500"
      case "blue":
        return "text-blue-500"
      case "purple":
        return "text-purple-500"
      case "pink":
        return "text-pink-500"
      default:
        return "text-foreground"
    }
  }

  const getIconComponent = (iconName) => {
    return Icons[iconName] || FolderIcon
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between px-2">
        <SidebarGroupLabel>我的列表</SidebarGroupLabel>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <SidebarMenu>
        {categories.map((category) => {
          const Icon = getIconComponent(category.icon)
          const count = getCategoryCount(category.id)
          return (
            <SidebarMenuItem key={category.id}>
              <SidebarMenuButton
                className={cn(
                  "w-full justify-between",
                  currentCategory === category.id && "bg-muted"
                )}
                onClick={() => onCategoryChange(category.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", getIconColor(category.color))} />
                  <span>{category.name}</span>
                </div>
                {count > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {count}
                  </span>
                )}
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">更多</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>删除分类</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新建列表</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入列表名称"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory()
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>图标和颜色</Label>
              <IconPicker value={selectedIcon} onChange={setSelectedIcon} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  )
}
