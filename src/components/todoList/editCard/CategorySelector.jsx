import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.jsx'
import { cn } from '@/lib/utils.js'
import { CategoryIcon } from '@/components/ui/category-icon'

export function CategorySelector({
  value,
  onChange,
  categories = [],
  className
}) {
  const renderCategoryItem = category => (
    <div className='flex items-center gap-2'>
      <CategoryIcon icon={category?.icon} color={category?.color} />
      <span>{category?.name}</span>
    </div>
  )

  const renderNoneItem = () => (
    <div className='flex items-center gap-2'>
      <CategoryIcon icon='FolderIcon' color='default' />
      <span>无列表</span>
    </div>
  )

  return (
    <div className={cn('space-y-0.5', className)}>
      <label className='text-sm font-medium'>列表</label>
      <Select
        value={value || 'none'}
        onValueChange={newValue =>
          onChange(newValue === 'none' ? null : newValue)
        }
      >
        <SelectTrigger className='data-[state=open]:ring-0 data-[state=open]:ring-offset-0 data-[state=closed]:ring-0 data-[state=closed]:ring-offset-0 ring-0 ring-offset-0'>
          <SelectValue placeholder='选择列表'>
            {value
              ? renderCategoryItem(categories.find(cat => cat.id === value))
              : renderNoneItem()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='none'>{renderNoneItem()}</SelectItem>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id}>
              {renderCategoryItem(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
