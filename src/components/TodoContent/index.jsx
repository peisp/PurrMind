import React, { useState, useEffect, useCallback } from 'react';
import CustomInput from '../CustomInput';
import PrimaryButton from '../PrimaryButton';

const TodoContent = ({ enterAction, onTodosChange, currentFilter }) => {
  const [newTodo, setNewTodo] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('default');

  const groups = [
    { id: 'default', name: '默认分组', icon: '📁' },
    { id: 'work', name: '工作', icon: '💼' },
    { id: 'personal', name: '个人', icon: '🏠' },
    { id: 'shopping', name: '购物', icon: '🛒' }
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const sortTodos = (items) => {
    return [...items].sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  };

  const saveTodos = useCallback((updatedTodos) => {
    const sortedTodos = sortTodos(updatedTodos);
    window.utools.dbStorage.setItem('todos', sortedTodos);
    onTodosChange(sortedTodos);
  }, [onTodosChange]);

  const showNotification = (content, type = 'add') => {
    const action = type === 'add' ? '添加' : type === 'delete' ? '删除' : '更新';
    window.utools.showNotification(`${action}【${content}】成功`);
  };

  useEffect(() => {
    const loadTodos = async () => {
      const items = window.utools.dbStorage.getItem('todos') || [];
      saveTodos(items);
    };
    loadTodos();
  }, [saveTodos]);

  useEffect(() => {
    if (enterAction?.type === 'over' && enterAction?.payload) {
      const content = enterAction.payload.trim();
      if (content) {
        const newItem = {
          id: Date.now(),
          content,
          completed: false,
          createTime: new Date().toISOString(),
          group: selectedGroup
        };
        const currentTodos = window.utools.dbStorage.getItem('todos') || [];
        saveTodos([...currentTodos, newItem]);
        showNotification(content);
      }
    }
  }, [enterAction, saveTodos, selectedGroup]);

  const addTodo = useCallback(() => {
    if (!newTodo?.trim()) return;
    
    const newItem = {
      id: Date.now(),
      content: newTodo.trim(),
      completed: false,
      createTime: new Date().toISOString(),
      group: selectedGroup
    };
    
    const currentTodos = window.utools.dbStorage.getItem('todos') || [];
    saveTodos([...currentTodos, newItem]);
    setNewTodo('');
    showNotification(newItem.content);
  }, [newTodo, saveTodos, selectedGroup]);

  const toggleTodo = useCallback((id) => {
    const currentTodos = window.utools.dbStorage.getItem('todos') || [];
    const updatedTodos = currentTodos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updatedTodos);
    const toggledTodo = updatedTodos.find(todo => todo.id === id);
    showNotification(toggledTodo.content, 'update');
  }, [saveTodos]);

  const deleteTodo = useCallback((id) => {
    const currentTodos = window.utools.dbStorage.getItem('todos') || [];
    const todoToDelete = currentTodos.find(todo => todo.id === id);
    const updatedTodos = currentTodos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
    showNotification(todoToDelete.content, 'delete');
  }, [saveTodos]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  }, [addTodo]);

  const todos = window.utools.dbStorage.getItem('todos') || [];
  const filteredTodos = todos.filter(todo => {
    if (currentFilter?.startsWith('group_')) {
      const groupId = currentFilter.replace('group_', '');
      return todo.group === groupId;
    }

    switch (currentFilter) {
      case 'completed':
        return todo.completed;
      case 'pending':
        return !todo.completed;
      case 'today':
        const today = new Date();
        const todoDate = new Date(todo.createTime);
        return (
          todoDate.getDate() === today.getDate() &&
          todoDate.getMonth() === today.getMonth() &&
          todoDate.getFullYear() === today.getFullYear()
        );
      default:
        return true;
    }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-8">
        待办事项
      </h1>
      
      <div className="flex gap-3 mb-8">
        <div className="relative">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="appearance-none pl-9 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 
                     dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          >
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.icon} {group.name}
              </option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {groups.find(g => g.id === selectedGroup)?.icon}
          </div>
        </div>
        <CustomInput
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="输入新的待办事项..."
          onKeyUp={handleKeyPress}
        />
        <PrimaryButton onClick={addTodo}>
          添加
        </PrimaryButton>
      </div>

      <div className="space-y-4">
        {filteredTodos.map(todo => (
          <div
            key={todo.id}
            className={`group flex items-center justify-between p-4 bg-white dark:bg-gray-800 
                      rounded-xl shadow-soft dark:shadow-none border border-gray-100 
                      dark:border-gray-700/50 transition-all duration-300
                      hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700/30
                      ${todo.completed ? 'opacity-80' : ''}`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600
                           text-primary-500 focus:ring-2 focus:ring-primary-400
                           transition-colors duration-200 cursor-pointer"
                />
                {todo.completed && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-gray-900 dark:text-white transition-all duration-300
                              ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                  {todo.content}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
                  <span>{groups.find(g => g.id === todo.group)?.icon}</span>
                  <span>{groups.find(g => g.id === todo.group)?.name}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {formatDate(todo.createTime)}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 
                         dark:text-gray-500 dark:hover:text-red-400 focus:outline-none
                         transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        
        {filteredTodos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">暂无待办事项</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoContent; 