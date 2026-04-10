// 获取AI模型设置信息（包括是否为自定义模型）
const getAIModelSetting = () => {
  const settings = window.utools?.dbStorage?.getItem('purrmind_settings')
  return (
    settings?.aiSetting || {
      model: 'deepseek-v3',
      icon: 'sparkles',
      cost: 1,
      custom: false
    }
  )
}

export async function getTaskObjByAi(taskMsg, onChunk) {
  const modelSetting = getAIModelSetting()
  const model = modelSetting.model

  console.log('使用模型:', model)
  console.log('模型设置:', modelSetting)

  // 如果是自定义模型，可以在此处添加特殊处理逻辑
  if (modelSetting.custom) {
    console.log('使用自定义模型，按token计费')
  } else {
    console.log('使用内置模型，消耗AI点数:', modelSetting.cost)
  }

  const messages = [
    {
      role: 'user',
      content:
        "# Extract and break down the user's input into a list of to-do tasks.\n" +
        'Return the result strictly in the following JSON array format:\n' +
        '\n' +
        '```json\n' +
        '[\n' +
        '  {\n' +
        '    "title": "Task title",\n' +
        '    "description": "Task description or null",\n' +
        '    "dueDate": "ISO 8601 string or null",\n' +
        '    "reminderTime": "ISO 8601 string or null",\n' +
        '    "recurrence": null\n' +
        '  }\n' +
        ']\n' +
        '```\n' +
        '\n' +
        '## Rules\n' +
        '1. The response must be a JSON array, even if there is only one task.\n' +
        '2. Field definitions:\n' +
        '    - title: required, non-empty string.\n' +
        "    - description: string or null. The user's original question can be output here.\n" +
        '    - dueDate: ISO 8601 string (e.g., "2025-05-18T09:00:00.000Z") or null. Only for one-time tasks.\n' +
        '    - reminderTime: ISO 8601 string or null. For one-time tasks: an optional reminder before dueDate. For recurring tasks: the next occurrence time.\n' +
        '    - recurrence: object or null. When set, it must be a JSON object (NOT a string).\n' +
        '3. Your response must only contain the JSON—no explanations, comments, or formatting outside the JSON.\n' +
        "4. Detect and match the language of the user's input. If the user speaks Chinese, return titles and descriptions in Chinese, etc.\n" +
        '5. Current time is ' +
        new Date().toISOString() +
        '. Calculate dates relative to this.\n' +
        "6. If the user mentions 'later' without a concrete time, calculate an appropriate time based on current time.\n" +
        '7. If the user mentions a day without a specific time, default to 9:00 AM. For "morning" use 9:00, "afternoon" 14:00, "evening" 19:00.\n' +
        '\n' +
        '## Recurring tasks (IMPORTANT)\n' +
        'There are TWO types of tasks with completely different field rules:\n' +
        '\n' +
        '### One-time tasks (no recurrence)\n' +
        '- Set dueDate and/or reminderTime as needed\n' +
        '- recurrence = null\n' +
        '\n' +
        '### Recurring tasks\n' +
        'Triggered by patterns like "every day", "every Monday", "every month on the 15th", etc.\n' +
        '- dueDate MUST be null (recurring tasks have no deadline)\n' +
        '- reminderTime = the next occurrence time (ISO 8601)\n' +
        '- recurrence = one of these objects:\n' +
        '  - Daily: { "type": "daily" }\n' +
        '  - Weekly: { "type": "weekly", "dayOfWeek": N } where N is 0=Sunday, 1=Monday, ..., 6=Saturday\n' +
        '  - Monthly: { "type": "monthly", "dayOfMonth": N } where N is 1-31\n' +
        '\n' +
        '## Examples\n' +
        'Input: "明天下午3点开会"\n' +
        'Output: [{ "title": "开会", "description": "明天下午3点开会", "dueDate": "2025-05-19T07:00:00.000Z", "reminderTime": null, "recurrence": null }]\n' +
        '\n' +
        'Input: "每天早上8点提醒我喝水"\n' +
        'Output: [{ "title": "喝水", "description": "每天早上8点提醒喝水", "dueDate": null, "reminderTime": "2025-05-19T00:00:00.000Z", "recurrence": { "type": "daily" } }]\n' +
        '\n' +
        'Input: "每周一上午9点开周会"\n' +
        'Output: [{ "title": "开周会", "description": "每周一上午9点开周会", "dueDate": null, "reminderTime": "2025-05-19T01:00:00.000Z", "recurrence": { "type": "weekly", "dayOfWeek": 1 } }]\n' +
        '\n' +
        'Input: "每月15号提醒还房贷"\n' +
        'Output: [{ "title": "还房贷", "description": "每月15号提醒还房贷", "dueDate": null, "reminderTime": "2025-06-15T01:00:00.000Z", "recurrence": { "type": "monthly", "dayOfMonth": 15 } }]'
    },
    {
      role: 'user',
      content: taskMsg
    }
  ]

  let fullContent = ''
  await window.utools.ai({ messages, model }, chunk => {
    // console.log('chunk:', chunk);
    if (chunk.content || chunk.reasoning_content) {
      fullContent += chunk.content
      if (typeof onChunk === 'function') {
        onChunk(chunk)
      }
    }
  })

  console.log('full content:', fullContent)

  // 1. 尝试提取 ```json ... ``` 代码块
  const match = fullContent.match(/```json\s*([\s\S]*?)```/)
  const jsonString = match ? match[1] : fullContent.trim()

  // 2. 解析 JSON
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    console.error('JSON解析失败:', e)
    // 3. 最后尝试提取第一个 [ ... ] 数组
    const arrayMatch = fullContent.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0])
      } catch (e2) {
        console.error('二次JSON解析失败:', e2)
      }
    }
  }
}
