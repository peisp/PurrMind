import React, {useMemo} from 'react';
import StatCard from '@/components/StatCard/index.jsx'

const Sidebar = ({todos = [], onFilterChange, currentFilter = 'all'}) => {
    const stats = useMemo(() => [
        {id: 'all', label: '全部任务', icon: '📋', value: todos.length, gradient: 'from-blue-500 to-blue-600'},
        {id: 'pending', label: '待完成', icon: '📝', value: todos.filter(todo => !todo.completed).length, gradient: 'from-amber-500 to-amber-600'},
        {id: 'completed', label: '已完成', icon: '✅', value: todos.filter(todo => todo.completed).length, gradient: 'from-green-500 to-green-600'},
        {id: 'today', label: '今日创建', icon: '📅', value: todos.filter(todo => {
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
        {id: 'default', label: '默认分组', icon: '📁', gradient: 'from-gray-500 to-gray-600', value: todos.filter(todo => todo.group === 'default').length},
        {id: 'work', label: '工作', icon: '💼', gradient: 'from-indigo-500 to-indigo-600', value: todos.filter(todo => todo.group === 'work').length},
        {id: 'personal', label: '个人', icon: '🏠', gradient: 'from-pink-500 to-pink-600', value: todos.filter(todo => todo.group === 'personal').length},
        {id: 'shopping', label: '购物', icon: '🛒', gradient: 'from-teal-500 to-teal-600', value: todos.filter(todo => todo.group === 'shopping').length
        }
    ], [todos]);

    return (
        <div className="w-72 h-full p-2 flex flex-col border-r border-gray-300 dark:border-gray-700/50">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    {stats.map(stat => (
                        <StatCard label={stat.label} value={stat.value} color={stat.gradient}
                                  onClick={() => onFilterChange(stat.id)}/>
                    ))}
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 px-2">
                        我的列表
                    </h3>
                    <div className=" grid-cols-2 gap-3">
                        {groups.map(group => (
                            <StatCard label={group.label} value={group.value} color={group.gradient}
                                      onClick={() => onFilterChange(group.id)}/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 