import { useEffect, useState } from 'react'
import { Index } from '@/Index.jsx'

export default function App() {
  const [route, setRoute] = useState('')
  const [enterAction, setEnterAction] = useState({})
  const [isDarkMode, setIsDarkMode] = useState(false)

  // 初始化应用设置和监听器 - 只运行一次
  useEffect(() => {
    // 监听系统颜色偏好
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = e => {
      const isDark = e.matches
      setIsDarkMode(isDark)
      updateThemeClass(isDark)
    }

    // 初始设置主题
    const initialDarkMode = darkModeMediaQuery.matches
    setIsDarkMode(initialDarkMode)
    updateThemeClass(initialDarkMode)

    // 监听主题变化
    darkModeMediaQuery.addEventListener('change', handleSystemThemeChange)

    // uTools插件生命周期事件
    window.utools.onPluginEnter(action => {
      setRoute(action.code)
      setEnterAction(action)
    })

    window.utools.onPluginOut(isKill => {
      setRoute('')
    })

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  const updateThemeClass = darkMode => {
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
