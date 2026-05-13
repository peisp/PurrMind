import { format } from 'date-fns'
import { DayLabel } from './day-label'
import { TodoCard } from './todo-card'

export function TimelineView({
  todos,
  onToggleStatus,
  onStar,
  onEdit,
  getCategoryName,
  categories
}) {
  // sortTodos 函数用于对 todos 列表进行排序。
  // 排序规则如下：
  // 1. 未完成的任务排在已完成任务之前。
  // 2. 对于未完成的任务：
  //    - 如果两个任务都有 dueDate，则按 dueDate 升序排列。
  //    - 如果只有一个任务有 dueDate，则该任务优先。
  //    - 如果两个任务都没有 dueDate，则比较 reminderTime，优先级同上。
  //    - 如果都没有 dueDate 和 reminderTime，则按 createdAt 升序排列。
  // 3. 对于已完成的任务，按 completedAt 降序排列（最新的完成时间优先）。
  const sortTodos = todos => {
    return [...todos].sort((a, b) => {
      // 已完成的任务排在后面
      if (a.completedAt && !b.completedAt) return 1
      if (!a.completedAt && b.completedAt) return -1

      const isCompleted = !!a.completedAt && !!b.completedAt

      if (!isCompleted) {
        // 比较未完成任务的 dueDate
        if (a.dueDate && b.dueDate) {
          const dateCompare = new Date(a.dueDate) - new Date(b.dueDate)
          if (dateCompare !== 0) return dateCompare
        } else if (a.dueDate) return -1
        else if (b.dueDate) return 1

        // 比较未完成任务的 reminderTime
        if (a.reminderTime && b.reminderTime) {
          const reminderCompare =
            new Date(a.reminderTime) - new Date(b.reminderTime)
          if (reminderCompare !== 0) return reminderCompare
        } else if (a.reminderTime) return -1
        else if (b.reminderTime) return 1

        // 最后比较创建时间
        return new Date(a.createdAt) - new Date(b.createdAt)
      } else {
        // 对已完成任务按完成时间倒序排列
        return new Date(b.completedAt) - new Date(a.completedAt)
      }
    })
  }

  const getTimelineTime = todo => {
    return todo.dueDate || todo.reminderTime || todo.createdAt
  }

  const groupTodosByDay = todos => {
    const groups = {}
    todos.forEach(todo => {
      const time = getTimelineTime(todo)
      const d = new Date(time)
      const day = isNaN(d.getTime()) ? 'invalid' : format(d, 'yyyy-MM-dd')
      if (!groups[day]) groups[day] = []
      groups[day].push(todo)
    })
    return groups
  }

  const sortedTodos = sortTodos(todos)

  const grouped = groupTodosByDay(sortedTodos)
  const days = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a))

  return (
    <div className='relative mx-3'>
      {/* 主时间轴线 */}
      <div className='absolute left-0.5 top-1.5 bottom-0 border-l-2 border-gray-200 border-dashed mt-4' />

      {days.map((day, dayIndex) => (
        <div key={day}>
          <div className='flex items-start relative'>
            {/* 时间轴节点 */}
            <div className='flex items-center mr-3 mt-4'>
              <div className='w-1.5 h-1.5 rounded-full bg-primary' />
            </div>
            {/* 右侧内容区域 */}
            <div className='flex-1'>
              <DayLabel date={day} />
              {/* 待办事项卡片 */}
              <div className='space-y-2'>
                {grouped[day].map(todo => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggleStatus={onToggleStatus}
                    onStar={onStar}
                    onEdit={onEdit}
                    getCategoryName={getCategoryName}
                    categories={categories}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
