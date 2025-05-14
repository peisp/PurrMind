import React, { useMemo } from 'react';
import StatCard from '../StatCard';
import FilterButton from '../FilterButton';

const Sidebar = ({ todos = [], onFilterChange, currentFilter = 'all' }) => {
  const stats = useMemo(() => {
    return {
      total: todos.length,
      completed: todos.filter(todo => todo.completed).length,
      pending: todos.filter(todo => !todo.completed).length,
      today: todos.filter(todo => {
        const today = new Date();
        const todoDate = new Date(todo.createTime);
        return (
          todoDate.getDate() === today.getDate() &&
          todoDate.getMonth() === today.getMonth() &&
          todoDate.getFullYear() === today.getFullYear()
        );
      }).length
    };
  }, [todos]);

  const filters = [
    { id: 'all', label: '全部任务', icon: '📋' },
    { id: 'pending', label: '待完成', icon: '📝' },
    { id: 'completed', label: '已完成', icon: '✅' },
    { id: 'today', label: '今日创建', icon: '📅' }
  ];

  const statCards = [
    { key: 'total', label: '总任务', color: 'gray' },
    { key: 'completed', label: '已完成', color: 'green' },
    { key: 'pending', label: '待完成', color: 'yellow' },
    { key: 'today', label: '今日新增', color: 'blue' }
  ];

  return (
    <aside className="w-64 h-full dark:border-gray-700 p-2 flex flex-col">
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ key, label, color }) => (
          <StatCard
            key={key}
            label={label}
            value={stats[key]}
            color={color}
          />
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          筛选
        </h3>
        <div className="space-y-2">
          {filters.map(filter => (
            <FilterButton
              key={filter.id}
              icon={filter.icon}
              label={filter.label}
              count={stats[filter.id === 'all' ? 'total' : 
                         filter.id === 'pending' ? 'pending' :
                         filter.id === 'completed' ? 'completed' : 'today']}
              active={currentFilter === filter.id}
              onClick={() => onFilterChange?.(filter.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
          版本 1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar; 