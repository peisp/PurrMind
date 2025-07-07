import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // 统一的检查函数，避免重复逻辑
    const checkIsMobile = () => mql.matches

    const onChange = () => {
      setIsMobile(checkIsMobile())
    }

    // 设置初始值
    setIsMobile(checkIsMobile())

    // 监听变化
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
