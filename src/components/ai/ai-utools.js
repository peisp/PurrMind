const getDefaultAIModel = () => {
  const settings = window.utools?.dbStorage?.getItem('purrmind_settings')
  return settings?.aiSetting?.model || 'deepseek-v3'
}

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
        "# Extract and break down the user's input into a list of to-do tasks. \n" +
        'Return the result strictly in the following JSON array format:\n' +
        '\n' +
        '```json\n' +
        '[\n' +
        '  {\n' +
        '    "title": "Task title",\n' +
        '    "description": "Task description or null, The user\'s original question can be output here",\n' +
        '    "dueDate": "Due date in ISO 8601 format or null",\n' +
        '    "reminderTime": "Reminder time in ISO 8601 format or null"\n' +
        '  }\n' +
        ']\n' +
        '```\n' +
        '## Please follow these rules:\n' +
        '1. The response must be a JSON array, even if there is only one task.\n' +
        '2. For each task object:\n' +
        '    - title is required, must be a non-empty string, and cannot be null.\n' +
        "    - description can be a string or null.The user's original question can be output here. \n" +
        '    - dueDate can be a string in ISO 8601 format (e.g., 2025-05-18T13:27:56.713Z) or null.\n' +
        '    - reminderTime can be a string in ISO 8601 format or null.\n' +
        '3.Your response must only contain the JSON—no explanations, comments, or formatting outside the JSON.\n' +
        "4. Detect and match the language of the user's input. If the user speaks Chinese, return the task titles " +
        'and descriptions in Chinese. If they use English, respond in English, etc. \n' +
        '5. current time is ' +
        new Date() +
        '.If the user mentions any time-related requirements ' +
        '(e.g., "tomorrow", "next Friday", etc.), calculate the appropriate datetime based on the provided ' +
        'current time.\n' +
        "6. If the user mentions 'later' without specifying a concrete time, calculate an appropriate time based on the current time.\n" +
        '7. If the user mentions a certain day without specifying the time, it defaults to 9am on that day. If they mention morning evening or similar, a suitable time is given'
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
  // 用正则提取 ```json 和 ``` 之间的内容
  const match = fullContent.match(/```json\s*([\s\S]*?)```/)

  if (match) {
    const jsonString = match[1] // 获取json字符串
    try {
      return JSON.parse(jsonString)
    } catch (e) {
      console.error('JSON解析失败:', e)
    }
  } else {
    console.log('没有找到JSON内容')
  }
}
