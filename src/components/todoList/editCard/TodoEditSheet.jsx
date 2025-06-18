import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Button } from '@/components/ui/button.jsx'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet.jsx'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils.js'
import { TimeSelector } from './TimeSelector.jsx'
import { CategorySelector } from './CategorySelector.jsx'
import { ReminderTimeSelector } from './ReminderTimeSelector.jsx'

const LimitedInput = ({ value, onChange, maxLength, placeholder, className }) => {
  return (
    <div className='space-y-0.5'>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn('', className)}
      />
      <div className='text-xs text-muted-foreground text-right'>
        {value.length}/{maxLength}
      </div>
    </div>
  )
}

const LimitedTextarea = ({ value, onChange, maxLength, placeholder, className }) => {
  return (
    <div className='space-y-0.5'>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(' resize-none', className)}
      />
      <div className='text-xs text-muted-foreground text-right'>
        {value.length}/{maxLength}
      </div>
    </div>
  )
}

export function TodoEditSheet ({
  isOpen,
  onOpenChange,
  todo,
  categories,
  onSave,
  onDelete,
  onCancel
}) {
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    dueDate: null,
    reminderTime: null
  })

  const [timeValidationError, setTimeValidationError] = useState('')

  useEffect(() => {
    if (todo) {
      setEditForm({
        title: todo.title || '',
        description: todo.description || '',
        categoryId: todo.categoryId || '',
        dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime) : null
      })
    }
  }, [todo])

  // 监听列表变化
  useEffect(() => {
    // 如果当前选中的列表不存在于新的列表列表中，则清除列表选择
    if (editForm.categoryId && !categories.find(cat => cat.id === editForm.categoryId)) {
      setEditForm(prev => ({ ...prev, categoryId: null }))
    }
  }, [categories, editForm.categoryId])

  // 校验提醒时间是否在截止时间之前
  useEffect(() => {
    if (editForm.dueDate && editForm.reminderTime) {
      if (editForm.reminderTime >= editForm.dueDate) {
        setTimeValidationError('提醒时间必须在截止时间之前')
      } else {
        setTimeValidationError('')
      }
    } else {
      setTimeValidationError('')
    }
  }, [editForm.dueDate, editForm.reminderTime])

  const handleSave = () => {
    // 如果有时间校验错误，不允许保存
    if (timeValidationError) {
      return
    }

    let dueDate = editForm.dueDate
    if (dueDate) {
      const hours = dueDate.getHours()
      const minutes = dueDate.getMinutes()
      if (hours === 0 && minutes === 0) {
        dueDate = new Date(dueDate)
        dueDate.setHours(9, 0, 0, 0)
      }
    }

    onSave({
      ...editForm,
      dueDate: dueDate?.toISOString(),
      reminderTime: editForm.reminderTime?.toISOString()
    })
  }

  const updateFormField = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className='p-2 flex flex-col'>
        <SheetHeader>
          <SheetTitle>编辑待办事项</SheetTitle>
        </SheetHeader>
        <div className='flex-1 space-y-1 overflow-y-auto'>
          {/* 标题输入 */}
          <div className='space-y-0.5'>
            <label className='text-sm font-medium'>标题</label>
            <LimitedInput
              value={editForm.title}
              onChange={(value) => updateFormField('title', value)}
              maxLength={50}
              placeholder='输入标题'
            />
          </div>

          {/* 描述输入 */}
          <div className='space-y-0.5'>
            <label className='text-sm font-medium'>描述</label>
            <LimitedTextarea
              value={editForm.description}
              onChange={(value) => updateFormField('description', value)}
              maxLength={200}
              placeholder='输入描述'
            />
          </div>

          {/* 类别选择器 */}
          <CategorySelector
            value={editForm.categoryId}
            onChange={(value) => updateFormField('categoryId', value)}
            categories={categories}
          />

          {/* 截止时间选择器 */}
          <TimeSelector
            label='截止时间'
            value={editForm.dueDate}
            onChange={(value) => updateFormField('dueDate', value)}
            placeholder='选择截止日期'
          />

          {/* 提醒时间选择器 */}
          <ReminderTimeSelector
            value={editForm.reminderTime}
            onChange={(value) => updateFormField('reminderTime', value)}
            dueDate={editForm.dueDate}
            validationError={timeValidationError}
          />
        </div>

        <SheetFooter className='flex items-center justify-between pt-2 mt-2'>
          <div className='flex-1 text-xs text-muted-foreground'>
            创建于 {todo?.createdAt ? format(new Date(todo.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN }) : ''}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='destructive'
              onClick={onDelete}
            >
              删除
            </Button>
            <Button
              variant='outline'
              onClick={onCancel}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={!!timeValidationError}
            >
              保存
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
