import React, { useMemo } from 'react';
import './index.css';

const Sidebar = ({ todos, onFilterChange, currentFilter }) => {
  // 计算统计信息
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

  // 过滤器选项
  const filters = [
    { id: 'all', label: '全部任务', icon: '📋' },
    { id: 'pending', label: '待完成', icon: '📝' },
    { id: 'completed', label: '已完成', icon: '✅' },
    { id: 'today', label: '今日创建', icon: '📅' }
  ];

  return (
    <div className="sidebar">

      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-label">总任务</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">已完成</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">待完成</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">今日新增</span>
          <span className="stat-value">{stats.today}</span>
        </div>
      </div>

      <div className="filters-container">
        <h3>筛选</h3>
        <div className="filter-list">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-item ${currentFilter === filter.id ? 'active' : ''}`}
              onClick={() => onFilterChange(filter.id)}
            >
              <span className="filter-icon">{filter.icon}</span>
              <span className="filter-label">{filter.label}</span>
              <span className="filter-count">
                {filter.id === 'all' && stats.total}
                {filter.id === 'pending' && stats.pending}
                {filter.id === 'completed' && stats.completed}
                {filter.id === 'today' && stats.today}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <p className="version">版本 1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar; 