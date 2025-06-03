import { format, getWeek, startOfMonth } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// 日期显示部分
export function CalendarDateDisplay({ currentDate, currentView }) {
  // 计算当月第几周
  const getWeekOfMonth = () => {
    const firstDayOfMonth = startOfMonth(currentDate)
    const firstWeek = getWeek(firstDayOfMonth, { weekStartsOn: 0 })
    const currentWeek = getWeek(currentDate, { weekStartsOn: 0 })
    return currentWeek - firstWeek + 1
  }

  return (
    <span className="text-lg font-medium">
      {currentView === 'week'
        ? `${format(currentDate, 'yyyy年MM月')} 第${getWeekOfMonth()}周`
        : format(currentDate, 'yyyy年MM月')}
    </span>
  )
}

// 按钮组部分
export function CalendarControls({
  currentView,
  onViewChange,
  onPrevMonth,
  onNextMonth,
  onToday
}) {
  return (
    <div className="flex items-center space-x-2">
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
        Beta
      </span>
      <div className="flex border rounded-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentView === 'week' ? 'default' : 'ghost'}
              className="rounded-r-none"
              onClick={() => onViewChange('week')}
            >
              周
            </Button>
          </TooltipTrigger>
          <TooltipContent>切换至周视图</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentView === 'month' ? 'default' : 'ghost'}
              className="rounded-l-none border-l"
              onClick={() => onViewChange('month')}
            >
              月
            </Button>
          </TooltipTrigger>
          <TooltipContent>切换至月视图</TooltipContent>
        </Tooltip>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onPrevMonth}>
            <ChevronLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{currentView === 'week' ? '上一周' : '上个月'}</TooltipContent>
      </Tooltip>

      <Button variant="ghost" onClick={onToday}>
        今天
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRight/>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{currentView === 'week' ? '下一周' : '下个月'}</TooltipContent>
      </Tooltip>
    </div>
  )
}
