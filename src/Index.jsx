import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.jsx'
import { AppSidebar } from '@/components/sidebar/app-sidebar.jsx'
import { Notification } from '@/components/notif/notification.jsx'
import { MainContent } from '@/components/main/MainContent.jsx'
import { useState, useEffect } from 'react'
import { useTodoManagement } from '@/hooks/useTodoManagement.js'

export function Index({ enterAction }) {
  const [viewMode, setViewMode] = useState('timeline')
  const [isDev, setIsDev] = useState(false)

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

  useEffect(() => {
    // 检查是否为开发环境
    if (window.utools?.isDev) {
      setIsDev(window.utools.isDev())
    }
  }, [])

  return (
    <div className='relative'>
      {/* 开发环境标识 */}
      {isDev && (
        <div className='absolute z-50 group'>
          <div className='bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white px-1.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-orange-400/20 backdrop-blur-sm hover:from-orange-500 hover:to-red-500 transition-all duration-200'>
            <div className='flex items-center gap-1.5'>
              <div className='w-2 h-2 bg-white/90 rounded-full animate-pulse' />
              <span className='tracking-wide'>DEV</span>
            </div>
          </div>
          {/* 悬浮提示 */}
          <div className='absolute -bottom-8 left-0 bg-gray-900/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none'>
            开发环境
          </div>
        </div>
      )}

      <SidebarProvider className='border-t'>
        <div className='grid w-full grid-cols-[auto_1fr]'>
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
        <Notification todos={todos} />
      </SidebarProvider>
    </div>
  )
}
