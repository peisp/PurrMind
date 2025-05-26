import { useEffect, useState } from 'react'
import { Index } from '@/Index.jsx'

export default function App() {
  const [route, setRoute] = useState('')
  const [enterAction, setEnterAction] = useState({})
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // 监听系统颜色偏好
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e) => {
      setIsDarkMode(e.matches)
      updateThemeClass(e.matches)
    }
    
    // 初始设置
    setIsDarkMode(darkModeMediaQuery.matches)
    updateThemeClass(darkModeMediaQuery.matches)
    
    // 监听变化
    darkModeMediaQuery.addEventListener('change', handleSystemThemeChange)

    // uTools插件生命周期
    window.utools.onPluginEnter((action) => {
      setRoute(action.code)
      setEnterAction(action)
    })
    window.utools.onPluginOut((isKill) => {
      setRoute('')
    })

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  const updateThemeClass = (darkMode) => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (route === 'index' || route === 'addItem') {
    return <Index enterAction={enterAction} isDarkMode={isDarkMode} />
  }

  return null
}
