import tracker from 'didida-sdk'
import pluginInfo from '../../public/plugin.json'

const SERVER = 'https://dd.peisp.com'
const APP_ID = 'purrmind'
const APP_VERSION = pluginInfo.version

let initialized = false
const isDev = () => !!window.utools?.isDev?.()

export function initTracker() {
  if (initialized) return

  try {
    const user = window.utools?.getUser?.()
    const userId = user?.nickname || ''

    tracker.init({
      appId: APP_ID,
      server: SERVER,
      appVersion: APP_VERSION,
      autoPageView: false,
      autoStayTime: true,
      autoEventTrack: false,
      userId
    })

    initialized = true
    if (isDev()) {
      console.log('[Tracker] 初始化成功', {
        server: SERVER,
        appId: APP_ID,
        appVersion: APP_VERSION,
        userId
      })
    }
  } catch (e) {
    console.error('Tracker初始化失败:', e)
  }
}

export function trackEvent(event, value) {
  if (!initialized) {
    if (isDev()) {
      console.warn('[Tracker] 上报跳过（未初始化）', { event, value })
    }
    return
  }
  try {
    tracker.track(event, value)
    if (isDev()) {
      console.log('[Tracker] 上报成功', { event, value })
    }
  } catch (e) {
    if (isDev()) {
      console.error('[Tracker] 上报失败', { event, value, error: e })
    }
  }
}

export function setTrackUser(nickname) {
  if (!initialized) return
  tracker.setUser(nickname)
  if (isDev()) {
    console.log('[Tracker] 设置用户', { nickname })
  }
}
