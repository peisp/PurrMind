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

export async function getTaskObjByAi(taskMsg, onChunk, categories) {
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

  const now = new Date().toISOString()

  const categoryList =
    categories && categories.length > 0
      ? categories.map(c => `${c.id}:${c.name}`).join('、')
      : null

  const categoryPrompt = categoryList
    ? `\n分类：
- categoryId：从以下分类中选择最匹配的，无合适分类则为null
- 可选分类：${categoryList}`
    : ''

  const categoryFormat = categoryList ? ',"categoryId":"分类id或null"' : ''

  const prompt = `将用户输入解析为待办任务JSON数组。仅输出JSON，无其他内容。

当前时间：${now}

格式：[{"title":"简短任务标题","description":"用户原始输入","dueDate":"ISO8601或null","reminderTime":"ISO8601或null","recurrence":null${categoryFormat}}]

字段说明：
- title：提炼简短的任务标题（如"开会"、"喝水"）
- description：固定填入用户的原始输入内容
- dueDate：任务实际发生/截止时间
- reminderTime：提前提醒时间，用户明确说"提醒"时设置，早于dueDate
- 若用户未区分提醒和截止，仅设dueDate，reminderTime=null${categoryPrompt}

规则：
- 语言与用户输入保持一致
- 未指定具体时间：早上9:00，下午14:00，晚上19:00，默认9:00
- 一次性任务：设dueDate，recurrence=null
- 重复任务：dueDate=null，reminderTime=下次触发时间，recurrence为以下之一：
  {"type":"daily"} | {"type":"weekly","dayOfWeek":0-6} | {"type":"monthly","dayOfMonth":1-31}
  (dayOfWeek: 0=周日,1=周一,...,6=周六)

示例："明天早上九点半提醒我十点钟需要去开会"
→ [{"title":"开会","description":"明天早上九点半提醒我十点钟需要去开会","dueDate":"明天T10:00:00","reminderTime":"明天T09:30:00","recurrence":null}]

用户输入：${taskMsg}`

  const messages = [{ role: 'user', content: prompt }]

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
  let parsed
  try {
    parsed = JSON.parse(jsonString)
  } catch (e) {
    console.error('JSON解析失败:', e)
    // 3. 最后尝试提取第一个 [ ... ] 数组
    const arrayMatch = fullContent.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      try {
        parsed = JSON.parse(arrayMatch[0])
      } catch (e2) {
        console.error('二次JSON解析失败:', e2)
      }
    }
  }

  // 确保返回有效数组
  if (!Array.isArray(parsed)) {
    throw new Error('AI返回的数据格式无效')
  }

  // 校验每个任务对象的基本结构
  return parsed
    .filter(
      task =>
        task &&
        typeof task === 'object' &&
        typeof task.title === 'string' &&
        task.title.trim()
    )
    .map(task => ({
      title: task.title,
      description: typeof task.description === 'string' ? task.description : '',
      dueDate: task.dueDate || null,
      reminderTime: task.reminderTime || null,
      recurrence: task.recurrence || null,
      categoryId: task.categoryId || null
    }))
}
