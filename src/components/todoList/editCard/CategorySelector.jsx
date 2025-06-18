import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.jsx'
import { cn } from '@/lib/utils.js'
import * as Icons from 'lucide-react'

export function CategorySelector ({
  value,
  onChange,
  categories = [],
  className
}) {
  const getIconComponent = (iconName) => {
    return Icons[iconName] || Icons.FolderIcon
  }

  const getColorClass = (color) => {
    switch (color) {
      case 'red':
        return 'text-red-500'
      case 'blue':
        return 'text-blue-500'
      case 'green':
        return 'text-green-500'
      case 'yellow':
        return 'text-yellow-500'
      case 'purple':
        return 'text-purple-500'
      case 'pink':
        return 'text-pink-500'
      default:
        return 'text-gray-500'
    }
  }

  const renderCategoryItem = (category, isSelected = false) => {
    const Icon = getIconComponent(category?.icon)
    return (
      <div className='flex items-center gap-2'>
        <div className='bg-amber-50 rounded-full h-6 w-6 flex items-center justify-center'>
          <Icon className={cn('h-4 w-4', getColorClass(category?.color))} />
        </div>
        <span>{category?.name}</span>
      </div>
    )
  }

  const renderNoneItem = () => (
    <div className='flex items-center gap-2'>
      <div className='bg-amber-50 rounded-full h-6 w-6 flex items-center justify-center'>
        <Icons.FolderIcon className='h-4 w-4 text-gray-500' />
      </div>
      <span>无列表</span>
    </div>
  )

  return (
    <div className={cn('space-y-0.5', className)}>
      <label className='text-sm font-medium'>列表</label>
      <Select
        value={value || 'none'}
        onValueChange={(newValue) => onChange(newValue === 'none' ? null : newValue)}
      >
        <SelectTrigger className='data-[state=open]:ring-0 data-[state=open]:ring-offset-0 data-[state=closed]:ring-0 data-[state=closed]:ring-offset-0 ring-0 ring-offset-0'>
          <SelectValue placeholder='选择列表'>
            {value
              ? renderCategoryItem(categories.find(cat => cat.id === value))
              : renderNoneItem()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='none'>
            {renderNoneItem()}
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {renderCategoryItem(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
