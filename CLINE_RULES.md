# PurrMind 项目 Cline 规则

## 1. 组件设计规范

### 1.1 组件结构
- 使用函数组件 + Hooks
- 组件按功能划分：容器组件(Index)和展示组件(TodoCard)
- 组件文件命名：kebab-case (如todo-card.jsx)
- 组件目录结构：
  ```
  components/
    ├── feature/ (功能组件)
    │   ├── component.jsx
    │   └── sub-components/
    └── ui/ (通用UI组件)
  ```

### 1.2 组件职责
- 容器组件处理业务逻辑和状态管理
- 展示组件只负责UI渲染和事件传递
- 复杂组件拆分为多个子组件(如AppSidebar拆分为NavMain/NavMyList)

### 1.3 Props规范
- 使用明确的propTypes或TypeScript类型定义
- 事件处理prop以`on`前缀命名(onToggleStatus)
- 布尔prop以`is`或`has`前缀命名(isOpen)

## 2. 状态管理

### 2.1 状态分类
- 本地UI状态(如settingsOpen)使用useState
- 全局应用状态(如todos)使用uTools dbStorage + 自定义事件
- 表单状态使用受控组件

### 2.2 状态更新
- 使用不可变数据更新模式
- 复杂状态逻辑提取到自定义Hook
- 跨组件状态通过props传递或自定义事件通信

## 3. 数据流规范

### 3.1 数据层
- 数据操作封装在db/todo.js
- 提供清晰的CRUD接口
- 数据变更触发storage事件通知

### 3.2 组件通信
- 父子组件通过props通信
- 深层组件通过Context或自定义事件通信
- 避免直接操作DOM

## 4. 样式系统

### 4.1 Tailwind使用
- 优先使用Tailwind工具类
- 自定义样式通过@layer添加到tailwind.config.cjs
- 动态class使用cn()工具函数合并

### 4.2 主题系统
- 使用CSS变量定义主题色
- 深色模式通过prefers-color-scheme检测
- 图标颜色通过getColorClass()统一管理

## 5. 性能优化

### 5.1 渲染优化
- 使用React.memo优化纯组件
- 复杂列表使用虚拟滚动
- 避免不必要的重新渲染

### 5.2 数据优化
- 大数据量使用分页加载
- 频繁更新使用防抖/节流
- 本地存储数据定期清理

## 6. 错误处理

### 6.1 数据校验
- 所有API调用添加错误边界
- 用户输入数据验证
- 关键操作添加确认提示

### 6.2 错误恢复
- 数据损坏时提供恢复机制
- 错误状态显示友好提示
- 关键错误记录到日志

## 7. 代码质量

### 7.1 可读性
- 组件代码不超过300行
- 复杂逻辑添加注释
- 提取工具函数到lib/utils.js

### 7.2 可维护性
- 保持单一职责原则
- 避免深层嵌套
- 定期重构技术债务

## 8. uTools插件规范（[官方文档](https://www.u-tools.cn/docs/developer/docs.html)）

### 8.1 生命周期
- 正确处理onPluginEnter/onPluginOut
- 插件退出时清理资源
- 保持轻量级设计

### 8.2 API使用
- dbStorage操作封装统一接口
- 使用utools API前检查可用性
- 敏感操作请求用户权限

## 9. 测试规范

### 9.1 单元测试
- 核心工具函数100%覆盖率
- 组件测试使用Testing Library
- 模拟uTools环境

### 9.2 E2E测试
- 关键用户流程测试
- 跨插件交互测试
- 性能基准测试
