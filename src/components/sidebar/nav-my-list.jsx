'use client'
import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  Plus,
  FolderIcon,
  StarOff,
  Trash2,
  MoreVertical,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { getAllCategories, getTodosByCategory, deleteCategory, addCategory } from '@/db/todo'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconPicker } from '@/components/ui/icon-picker'
import * as Icons from 'lucide-react'
import { getAllTodos } from '@/db/todo'

export function NavMyList ({
  onCategoryChange,
  currentCategory
}) {
  const [categories, setCategories] = useState([])
  const [todos, setTodos] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState({ icon: 'FolderIcon', color: 'default' })
  const [hoveredItem, setHoveredItem] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)

  useEffect(() => {
    loadCategories()
    loadTodos()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('todo-updated', handleTodoUpdated)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('todo-updated', handleTodoUpdated)
    }
  }, [])

  const handleStorageChange = (e) => {
    if (e.key === 'todos' || e.key === 'categories') {
      loadCategories()
      loadTodos()
    }
  }

  const handleTodoUpdated = () => {
    loadCategories()
    loadTodos()
  }

  const loadCategories = () => {
    const allCategories = getAllCategories()
    setCategories(allCategories)
  }

  const loadTodos = () => {
    const allTodos = getAllTodos()
    setTodos(allTodos)
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName,
        icon: selectedIcon.icon,
        color: selectedIcon.color
      })
      setNewCategoryName('')
      setSelectedIcon({ icon: 'FolderIcon', color: 'default' })
      setIsDialogOpen(false)
      loadCategories()
      window.dispatchEvent(new Event('todo-updated'))
    }
  }

  const handleDeleteCategory = (id, e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    deleteCategory(id)
    loadCategories()
    setOpenDropdownId(null)
    window.dispatchEvent(new Event('todo-updated'))
  }

  const getCategoryCount = (categoryId) => {
    const count = todos.filter(todo => !todo.completed && todo.categoryId === categoryId).length
    return count > 99 ? '99+' : count
  }

  const getColorClass = (color) => {
    switch (color) {
      case 'red':
        return 'text-red-500'
      case 'blue':
        return 'text-blue-500'
      case 'green':
        return 'text-green-500'
      case 'yellow':
        return 'text-yellow-500'
      case 'purple':
        return 'text-purple-500'
      case 'pink':
        return 'text-pink-500'
      default:
        return 'text-gray-500'
    }
  }

  const getIconComponent = (iconName) => {
    return Icons[iconName] || FolderIcon
  }

  const handleDropdownOpenChange = (open, categoryId) => {
    if (!open) {
      setOpenDropdownId(null)
      if (hoveredItem !== categoryId) {
        setHoveredItem(null)
      }
    } else {
      setOpenDropdownId(categoryId)
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between px-2">
        <SidebarGroupLabel className="pl-0">我的列表</SidebarGroupLabel>
        <Button
          variant="ghost"
          size="icon"
          className="h-8"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus/>
        </Button>
      </div>
      <SidebarGroupContent>
        <SidebarMenu>
          {categories.map((category) => {
            const Icon = getIconComponent(category.icon)
            const count = getCategoryCount(category.id)
            const isActive = currentCategory === category.id
            const isHovered = hoveredItem === category.id
            const isDropdownOpen = openDropdownId === category.id

            return (
              <SidebarMenuItem
                key={category.id}
                onMouseEnter={() => setHoveredItem(category.id)}
                onMouseLeave={() => {
                  if (openDropdownId !== category.id) {
                    setHoveredItem(null)
                  }
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <SidebarMenuButton
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'flex-1 justify-between mr-2 h-10',
                      isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground'
                    )}
                    onClick={(e) => {
                      if (isActive) {
                        e.preventDefault()
                        return false;
                      }
                      onCategoryChange(category.id, category.name)
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="bg-background rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            getColorClass(category.color)
                          )}
                        />
                      </div>
                      <span className="truncate">
                        {category.name}
                      </span>
                    </div>
                  <div 
                    className="relative flex items-center transition-all duration-200"
                    data-sidebar="menu-action"
                  >
                    <span
                      className={cn(
                        'absolute right-0 rounded-full px-2 py-0.5 text-xs transition-transform duration-200',
                        (isHovered || isDropdownOpen) && 'translate-x-[-100%]'
                      )}
                    >
                      {count}
                    </span>
                    <DropdownMenu
                      open={isDropdownOpen}
                      onOpenChange={(open) => handleDropdownOpenChange(open, category.id)}
                    >
                      <DropdownMenuTrigger asChild>
                        <div
                          className={cn(
                            "h-6 w-6 p-0 flex items-center justify-center cursor-pointer hover:bg-accent rounded-sm opacity-0 transition-opacity duration-200",
                            isActive ? "text-white" : "text-black",
                            (isHovered || isDropdownOpen) && "opacity-100"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleDeleteCategory(category.id, e)}
                        >
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  </SidebarMenuButton>
                </div>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建列表</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入列表名称"
              />
            </div>
            <div className="space-y-2">
              <Label>图标</Label>
              <IconPicker
                value={selectedIcon}
                onChange={setSelectedIcon}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddCategory}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  )
}
