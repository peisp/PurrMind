import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'

const colorClassMap = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  purple: 'text-purple-500',
  pink: 'text-pink-500'
}

export function getColorClass(color) {
  return colorClassMap[color] || 'text-gray-500'
}

export function getIconComponent(iconName) {
  return Icons[iconName] || Icons.FolderIcon
}

export function CategoryIcon({ icon, color, size = 'default', className }) {
  const Icon = getIconComponent(icon)

  const sizeClasses = {
    sm: { wrapper: 'h-5 w-5', icon: 'h-3 w-3' },
    default: { wrapper: 'h-6 w-6', icon: 'h-4 w-4' },
    lg: { wrapper: 'h-8 w-8', icon: 'h-5 w-5' }
  }

  const s = sizeClasses[size] || sizeClasses.default

  return (
    <div
      className={cn(
        'bg-background rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.1)]',
        s.wrapper,
        className
      )}
    >
      <Icon className={cn(s.icon, getColorClass(color))} />
    </div>
  )
}
