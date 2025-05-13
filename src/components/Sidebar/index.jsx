import React, { useMemo } from 'react';

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

  return (
    <aside className="w-64 h-full dark:border-gray-700 p-2 flex flex-col">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <span className="text-sm text-gray-600 dark:text-gray-400 block">
              {key === 'total' && '总任务'}
              {key === 'completed' && '已完成'}
              {key === 'pending' && '待完成'}
              {key === 'today' && '今日新增'}
            </span>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          筛选
        </h3>
        <div className="space-y-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => onFilterChange?.(filter.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors
                ${currentFilter === filter.id
                  ? 'bg-primary bg-opacity-10 text-primary'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
            >
              <span className="text-xl mr-2">{filter.icon}</span>
              <span className="flex-1">{filter.label}</span>
              <span className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {filter.id === 'all' && stats.total}
                {filter.id === 'pending' && stats.pending}
                {filter.id === 'completed' && stats.completed}
                {filter.id === 'today' && stats.today}
              </span>
            </button>
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