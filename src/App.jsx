import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import TodoContent from './components/TodoContent'

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
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          todos={todos}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
        <main className="flex-1 overflow-auto">
          <TodoContent 
            enterAction={enterAction}
            onTodosChange={setTodos}
            currentFilter={currentFilter}
          />
        </main>
      </div>
    )
  }

  return false
}