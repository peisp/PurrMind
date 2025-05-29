import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function CalendarHeader({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  onToday 
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-lg font-medium">
        {format(currentDate, 'yyyy年MM月')}
      </span>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onPrevMonth}>
              <ChevronLeft />
            </Button>
          </TooltipTrigger>
          <TooltipContent>上个月</TooltipContent>
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
          <TooltipContent>下个月</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
