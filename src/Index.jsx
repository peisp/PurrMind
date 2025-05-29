import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.jsx'
import { AppSidebar } from '@/components/sidebar/app-sidebar.jsx'
import { TodoNotification } from '@/components/todoList/todo-notification.jsx'
import { MainContent } from '@/components/main/MainContent.jsx'
import { useState } from 'react'
import { useTodoManagement } from '@/hooks/useTodoManagement.js'

import { useEffect } from 'react'

export function Index({ enterAction }) {
  const [viewMode, setViewMode] = useState('timeline')
  const [forceUpdate, setForceUpdate] = useState(0)

  useEffect(() => {
    setForceUpdate(prev => prev + 1)
  }, [viewMode])
  const {
    todos,
    categories,
    currentLabel,
    currentIcon,
    currentCategory,
    showCompleted,
    currentFilter,
    defaultDueDate,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleToggleStatus,
    handleFilterChange,
    handleCategoryChange,
    setShowCompleted
  } = useTodoManagement(enterAction)
  
  return (
    <SidebarProvider className="border-t">
      <div className="grid w-full grid-cols-[auto_1fr]">
        <AppSidebar 
          onFilterChange={handleFilterChange}
          onCategoryChange={handleCategoryChange}
          currentFilter={currentFilter}
          currentCategory={currentCategory}
        />
        <SidebarInset>
          <MainContent
            todos={todos}
            categories={categories}
            currentLabel={currentLabel}
            currentIcon={currentIcon}
            currentCategory={currentCategory}
            showCompleted={showCompleted}
            currentFilter={currentFilter}
            defaultDueDate={defaultDueDate}
            handleAddTodo={handleAddTodo}
            handleUpdateTodo={handleUpdateTodo}
            handleDeleteTodo={handleDeleteTodo}
            handleToggleStatus={handleToggleStatus}
            setShowCompleted={setShowCompleted}
            viewMode={viewMode}
            setViewMode={setViewMode}
            key={viewMode} // 添加key强制重新渲染
          />
        </SidebarInset>
      </div>
      <TodoNotification todos={todos} />
    </SidebarProvider>
  )
}
