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
  Pencil,
  Pin
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getAllCategories,
  getTodosByCategory,
  deleteCategory,
  addCategory,
  updateCategory,
  getAllTodos
} from '@/db/todo'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconPicker } from '@/components/ui/icon-picker'
import * as Icons from 'lucide-react'
import { openStickyNote } from '@/lib/sticky-note'

export function NavMyList({ onCategoryChange, currentCategory }) {
  const [categories, setCategories] = useState([])
  const [todos, setTodos] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState({
    icon: 'FolderIcon',
    color: 'default'
  })
  const [editingCategory, setEditingCategory] = useState(null)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)

  // 数据加载函数 - 使用useCallback避免不必要的重新创建
  const loadData = useCallback(() => {
    const allCategories = getAllCategories()
    const allTodos = getAllTodos()
    setCategories(allCategories)
    setTodos(allTodos)
  }, [])

  // 初始化加载
  useEffect(() => {
    loadData()
  }, [loadData])

  // 外部事件监听 - 分离事件监听逻辑
  useEffect(() => {
    const handleStorageChange = e => {
      if (e.key === 'todos' || e.key === 'categories') {
        loadData()
      }
    }

    const handleTodoUpdated = () => {
      loadData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('todo-updated', handleTodoUpdated)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('todo-updated', handleTodoUpdated)
    }
  }, [loadData])

  const handleOpenCreate = useCallback(() => {
    setEditingCategory(null)
    setNewCategoryName('')
    setSelectedIcon({ icon: 'FolderIcon', color: 'default' })
    setIsDialogOpen(true)
  }, [])

  const handleOpenEdit = useCallback((category, e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setSelectedIcon({ icon: category.icon, color: category.color || 'default' })
    setOpenDropdownId(null)
    setIsDialogOpen(true)
  }, [])

  const handleSaveCategory = useCallback(() => {
    if (!newCategoryName.trim()) return

    if (editingCategory) {
      const updated = updateCategory(editingCategory.id, {
        name: newCategoryName,
        icon: selectedIcon.icon,
        color: selectedIcon.color
      })
      if (updated) {
        setCategories(prev =>
          prev.map(cat => (cat.id === updated.id ? updated : cat))
        )
      }
    } else {
      const newCategory = addCategory({
        name: newCategoryName,
        icon: selectedIcon.icon,
        color: selectedIcon.color
      })
      setCategories(prev => [...prev, newCategory])
    }

    setNewCategoryName('')
    setSelectedIcon({ icon: 'FolderIcon', color: 'default' })
    setEditingCategory(null)
    setIsDialogOpen(false)
    window.dispatchEvent(new Event('todo-updated'))
  }, [newCategoryName, selectedIcon, editingCategory])

  const handleDeleteCategory = useCallback((id, e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    deleteCategory(id)

    // 直接从状态中移除而不是重新加载
    setCategories(prev => prev.filter(cat => cat.id !== id))
    setOpenDropdownId(null)
    window.dispatchEvent(new Event('todo-updated'))
  }, [])

  // 使用useMemo优化分类计数计算
  const categoryCountMap = useMemo(() => {
    const countMap = new Map()
    todos.forEach(todo => {
      if (!todo.completed && todo.categoryId) {
        const current = countMap.get(todo.categoryId) || 0
        countMap.set(todo.categoryId, current + 1)
      }
    })
    return countMap
  }, [todos])

  const getCategoryCount = useCallback(
    categoryId => {
      const count = categoryCountMap.get(categoryId) || 0
      return count > 99 ? '99+' : count
    },
    [categoryCountMap]
  )

  const getColorClass = useCallback(color => {
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
  }, [])

  const getIconComponent = useCallback(iconName => {
    return Icons[iconName] || FolderIcon
  }, [])

  const handleDropdownOpenChange = useCallback(
    (open, categoryId) => {
      if (!open) {
        setOpenDropdownId(null)
        if (hoveredItem !== categoryId) {
          setHoveredItem(null)
        }
      } else {
        setOpenDropdownId(categoryId)
      }
    },
    [hoveredItem]
  )

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <div className='flex items-center justify-between px-2'>
        <SidebarGroupLabel className='pl-0'>我的列表</SidebarGroupLabel>
        <Button
          variant='ghost'
          size='icon'
          className='h-8'
          onClick={handleOpenCreate}
        >
          <Plus />
        </Button>
      </div>
      <SidebarGroupContent>
        <SidebarMenu>
          {categories.map(category => {
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
                <div className='flex items-center justify-between w-full'>
                  <SidebarMenuButton
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'flex-1 justify-between mr-2 h-10',
                      isActive &&
                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground'
                    )}
                    onClick={e => {
                      if (isActive) {
                        e.preventDefault()
                        return false
                      }
                      onCategoryChange(category.id, category.name)
                    }}
                  >
                    <div className='flex items-center gap-2 min-w-0 flex-1'>
                      <div className='bg-background rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.1)]'>
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            getColorClass(category.color)
                          )}
                        />
                      </div>
                      <span className='truncate'>{category.name}</span>
                    </div>
                    <div
                      className='relative flex items-center transition-all duration-200 -mr-6'
                      data-sidebar='menu-action'
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
                        onOpenChange={open =>
                          handleDropdownOpenChange(open, category.id)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <div
                            className={cn(
                              'h-6 w-6 p-0 flex items-center justify-center cursor-pointer hover:bg-accent rounded-sm opacity-0 transition-opacity duration-200',
                              isActive ? 'text-white' : 'text-black',
                              (isHovered || isDropdownOpen) && 'opacity-100'
                            )}
                            onClick={e => {
                              e.stopPropagation()
                              e.preventDefault()
                            }}
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align='end'
                          onClick={e => e.stopPropagation()}
                        >
                          <DropdownMenuItem
                            onClick={e => handleOpenEdit(category, e)}
                          >
                            <Pencil className='h-4 w-4 mr-2' />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation()
                              e.preventDefault()
                              setOpenDropdownId(null)
                              openStickyNote({ categoryId: category.id })
                            }}
                          >
                            <Pin className='h-4 w-4 mr-2' />
                            钉到桌面
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive'
                            onClick={e => handleDeleteCategory(category.id, e)}
                          >
                            <Trash2 className='h-4 w-4 mr-2' />
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
            <DialogTitle>
              {editingCategory ? '编辑列表' : '新建列表'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>名称</Label>
              <Input
                id='name'
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder='输入列表名称'
              />
            </div>
            <div className='space-y-2'>
              <Label>图标</Label>
              <IconPicker value={selectedIcon} onChange={setSelectedIcon} />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  )
}
