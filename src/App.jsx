import { useEffect, useState } from 'react'
import { Index } from '@/Index.jsx'

export default function App() {
  const [route, setRoute] = useState('')
  const [enterAction, setEnterAction] = useState({})

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
    return <Index enterAction={enterAction} />
  }

  return <Index />
}