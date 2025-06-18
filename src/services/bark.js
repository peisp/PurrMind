// Bark推送服务
export class BarkService {
  constructor () {
    this.settings = this.getSettings()
  }

  // 获取bark设置
  getSettings () {
    const settings = window.utools.dbStorage.getItem('purrmind_bark_settings') || {}
    return {
      enabled: settings.enabled || false,
      apiUrl: settings.apiUrl || 'https://api.day.app',
      token: settings.token || '',
      sound: 'default',
      icon: 'https://res.u-tools.cn/plugins/logo/tmdyai7glykmor3my3vp2sy88dao1fgk.png',
      group: '喵咚咚'
    }
  }

  // 保存bark设置
  saveSettings (settings) {
    window.utools.dbStorage.setItem('purrmind_bark_settings', settings)
    this.settings = settings
  }

  // 发送bark推送
  async sendNotification (title, content, options = {}) {
    if (!this.settings.enabled || !this.settings.token) {
      return { success: false, error: 'Bark推送未启用或Token未配置' }
    }

    try {
      const url = this.buildUrl(title, content, options)
      console.log('Bark推送URL:', url) // 调试日志
      
      const response = await fetch(url, {
        method: 'GET'
      })

      // 检查响应状态
      if (!response.ok) {
        return { success: false, error: `HTTP错误: ${response.status} ${response.statusText}` }
      }

      // 获取响应文本
      const responseText = await response.text()
      console.log('Bark响应:', responseText) // 调试日志

      // 尝试解析JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        // 如果不是JSON格式，检查是否是成功响应
        if (response.status === 200) {
          return { success: true, message: '推送发送成功（非JSON响应）' }
        } else {
          return { success: false, error: `响应解析失败: ${responseText}` }
        }
      }

      // 处理JSON响应
      if (result.code === 200) {
        return { success: true, message: result.message || '推送发送成功' }
      } else {
        return { success: false, error: result.message || '推送发送失败' }
      }
    } catch (error) {
      console.error('Bark推送失败:', error)
      return { success: false, error: error.message || '网络错误' }
    }
  }

  // 构建推送URL
  buildUrl (title, content, options = {}) {
    const {
      sound = this.settings.sound,
      icon = this.settings.icon,
      group = this.settings.group,
      url: jumpUrl
    } = options

    let pushUrl = `${this.settings.apiUrl}/${this.settings.token}/${encodeURIComponent(title)}`

    if (content) {
      pushUrl += `/${encodeURIComponent(content)}`
    }

    const params = new URLSearchParams()

    if (sound && sound !== 'default') {
      params.append('sound', sound)
    }

    if (icon) {
      params.append('icon', icon)
    }

    if (group) {
      params.append('group', group)
    }

    if (jumpUrl) {
      params.append('url', jumpUrl)
    }

    const queryString = params.toString()
    return queryString ? `${pushUrl}?${queryString}` : pushUrl
  }

  // 测试连接
  async testConnection () {
    if (!this.settings.token) {
      return { success: false, error: 'Token未配置' }
    }

    return await this.sendNotification(
      '测试通知',
      '喵咚咚 Bark推送配置测试成功！',
      { sound: 'ping' }
    )
  }
}

// 导出单例实例
export const barkService = new BarkService()
