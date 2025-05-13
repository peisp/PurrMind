const { dbStorage } = window.utools;

// 初始化数据库
const initDB = () => {
  const todos = dbStorage.getItem('todos');
  if (!todos) {
    dbStorage.setItem('todos', []);
  }
};

// 添加待办事项
const addTodo = (content) => {
  const todos = dbStorage.getItem('todos') || [];
  const newTodo = {
    id: Date.now(),
    content,
    completed: false,
    createTime: new Date().toISOString()
  };
  todos.push(newTodo);
  dbStorage.setItem('todos', todos);
  return newTodo;
};

// 获取所有待办事项
const getAllTodos = () => {
  return dbStorage.getItem('todos') || [];
};

// 更新待办事项状态
const updateTodoStatus = (id, completed) => {
  const todos = dbStorage.getItem('todos') || [];
  const updatedTodos = todos.map(todo => 
    todo.id === id ? { ...todo, completed } : todo
  );
  dbStorage.setItem('todos', updatedTodos);
  return updatedTodos;
};

// 删除待办事项
const deleteTodo = (id) => {
  const todos = dbStorage.getItem('todos') || [];
  const updatedTodos = todos.filter(todo => todo.id !== id);
  dbStorage.setItem('todos', updatedTodos);
  return updatedTodos;
};

// 初始化数据库
initDB();

// 导出所有方法
window.todoServices = {
  addTodo,
  getAllTodos,
  updateTodoStatus,
  deleteTodo
}; 