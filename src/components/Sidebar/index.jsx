import React, { useMemo } from 'react';

const Sidebar = ({ todos = [], onFilterChange, currentFilter = 'all' }) => {
  const stats = useMemo(() => [
    { 
      id: 'all',
      label: '全部任务',
      icon: '📋',
      value: todos.length,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'pending',
      label: '待完成',
      icon: '📝',
      value: todos.filter(todo => !todo.completed).length,
      gradient: 'from-amber-500 to-amber-600'
    },
    {
      id: 'completed',
      label: '已完成',
      icon: '✅',
      value: todos.filter(todo => todo.completed).length,
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'today',
      label: '今日创建',
      icon: '📅',
      value: todos.filter(todo => {
        const today = new Date();
        const todoDate = new Date(todo.createTime);
        return (
          todoDate.getDate() === today.getDate() &&
          todoDate.getMonth() === today.getMonth() &&
          todoDate.getFullYear() === today.getFullYear()
        );
      }).length,
      gradient: 'from-purple-500 to-purple-600'
    }
  ], [todos]);

  // 按分组统计待办事项
  const groups = useMemo(() => [
    {
      id: 'default',
      name: '默认分组',
      icon: '📁',
      gradient: 'from-gray-500 to-gray-600',
      value: todos.filter(todo => todo.group === 'default').length
    },
    {
      id: 'work',
      name: '工作',
      icon: '💼',
      gradient: 'from-indigo-500 to-indigo-600',
      value: todos.filter(todo => todo.group === 'work').length
    },
    {
      id: 'personal',
      name: '个人',
      icon: '🏠',
      gradient: 'from-pink-500 to-pink-600',
      value: todos.filter(todo => todo.group === 'personal').length
    },
    {
      id: 'shopping',
      name: '购物',
      icon: '🛒',
      gradient: 'from-teal-500 to-teal-600',
      value: todos.filter(todo => todo.group === 'shopping').length
    }
  ], [todos]);

  return (
    <aside className="w-72 h-full border-r border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col animate-slide-in">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 px-2">
            状态
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(stat => (
              <button
                key={stat.id}
                onClick={() => onFilterChange(stat.id)}
                className={`group p-4 rounded-xl text-left transition-all duration-200
                  ${currentFilter === stat.id
                    ? 'bg-gradient-to-r shadow-soft scale-[1.02] text-white'
                    : 'bg-white dark:bg-gray-800 hover:scale-[1.02] hover:shadow-soft'
                  } ${currentFilter === stat.id ? stat.gradient : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{stat.icon}</span>
                  <span className={`text-sm font-medium 
                    ${currentFilter === stat.id
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {stat.label}
                  </span>
                </div>
                <span className={`text-2xl font-bold
                  ${currentFilter === stat.id
                    ? 'text-white'
                    : 'bg-gradient-to-r bg-clip-text text-transparent ' + stat.gradient
                  }`}>
                  {stat.value}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 px-2">
            分组
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => onFilterChange(`group_${group.id}`)}
                className={`group p-4 rounded-xl text-left transition-all duration-200
                  ${currentFilter === `group_${group.id}`
                    ? 'bg-gradient-to-r shadow-soft scale-[1.02] text-white'
                    : 'bg-white dark:bg-gray-800 hover:scale-[1.02] hover:shadow-soft'
                  } ${currentFilter === `group_${group.id}` ? group.gradient : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{group.icon}</span>
                  <span className={`text-sm font-medium 
                    ${currentFilter === `group_${group.id}`
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {group.name}
                  </span>
                </div>
                <span className={`text-2xl font-bold
                  ${currentFilter === `group_${group.id}`
                    ? 'text-white'
                    : 'bg-gradient-to-r bg-clip-text text-transparent ' + group.gradient
                  }`}>
                  {group.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          版本 1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar; 