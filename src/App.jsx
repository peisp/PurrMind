import { useEffect, useState } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar.jsx'
import { AppSidebar } from '@/components/app-sidebar.jsx'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb.jsx'
import { NavActions } from '@/components/nav-actions.jsx'

export default function App() {
  const [enterAction, setEnterAction] = useState({})
  const [route, setRoute] = useState('')
  const [todos, setTodos] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')

  useEffect(() => {
    window.utools.onPluginEnter((action) => {
      setRoute(action.code)
      setEnterAction(action)
    })
    window.utools.onPluginOut((isKill) => {
      setRoute('')
    })
  }, [])

  if (route === 'index' || route === 'addItem') {
    return (
        <SidebarProvider>
          <div className="grid w-full grid-cols-[auto_1fr]">
            <AppSidebar />
            <SidebarInset className="flex h-screen min-w-0 flex-col">
              <header className="flex h-14 shrink-0 items-center gap-2 border-b">
                <div className="flex flex-1 items-center gap-2 px-3">
                  <SidebarTrigger />
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="line-clamp-1">Project Management & Task Tracking</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="ml-auto px-3">
                  <NavActions />
                </div>
              </header>
              <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50" />
                <div className="mx-auto h-full w-full max-w-3xl rounded-xl bg-muted/50" />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
    )
  }

  return null
}