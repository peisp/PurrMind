// 飞书群机器人推送服务
export class FeishuService {
  constructor() {
    this.settings = this.getSettings()
  }

  // 获取飞书设置
  getSettings() {
    const settings =
      window.utools.dbStorage.getItem('purrmind_feishu_settings') || {}
    return {
      enabled: settings.enabled || false,
      webhookUrl: settings.webhookUrl || '',
      keyword: settings.keyword || '',
      secret: settings.secret || ''
    }
  }

  // 保存飞书设置
  saveSettings(settings) {
    window.utools.dbStorage.setItem('purrmind_feishu_settings', settings)
    this.settings = settings
  }

  // 生成签名（飞书签名校验：HmacSHA256(key = timestamp + "\n" + secret, message = "") 后 Base64）
  async genSign(timestamp) {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(`${timestamp}\n${this.settings.secret}`),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, new Uint8Array(0))
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
  }

  // 构建消息文本（关键词校验要求消息中包含关键词）
  buildText(title, content) {
    let text = content ? `${title}\n${content}` : title
    if (this.settings.keyword && !text.includes(this.settings.keyword)) {
      text = `【${this.settings.keyword}】${text}`
    }
    return text
  }

  // 发送飞书推送
  async sendNotification(title, content) {
    if (!this.settings.enabled || !this.settings.webhookUrl) {
      return { success: false, error: '飞书推送未启用或Webhook地址未配置' }
    }

    try {
      const body = {
        msg_type: 'text',
        content: { text: this.buildText(title, content) }
      }

      if (this.settings.secret) {
        const timestamp = Math.floor(Date.now() / 1000).toString()
        body.timestamp = timestamp
        body.sign = await this.genSign(timestamp)
      }

      const response = await fetch(this.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP错误: ${response.status} ${response.statusText}`
        }
      }

      const result = await response.json()
      console.log('飞书响应:', result) // 调试日志

      // 新版返回 { code: 0 }，旧版返回 { StatusCode: 0 }
      if (result.code === 0 || result.StatusCode === 0) {
        return { success: true, message: '推送发送成功' }
      }
      return { success: false, error: result.msg || '推送发送失败' }
    } catch (error) {
      console.error('飞书推送失败:', error)
      return { success: false, error: error.message || '网络错误' }
    }
  }

  // 测试连接
  async testConnection() {
    if (!this.settings.webhookUrl) {
      return { success: false, error: 'Webhook地址未配置' }
    }

    return await this.sendNotification(
      '测试通知',
      '喵咚咚 飞书推送配置测试成功！'
    )
  }
}

// 导出单例实例
export const feishuService = new FeishuService()
