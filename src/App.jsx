import { useEffect, useState } from 'react'
import Todo from './Todo/index.jsx'

export default function App () {
  const [enterAction, setEnterAction] = useState({})
  const [route, setRoute] = useState('')

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
    return <Todo enterAction={enterAction}/>
  }

  return false
}