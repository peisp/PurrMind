# PurrMind - uTools 待办事项管理插件

<div align="center">
  <img src="public/logo.png" alt="PurrMind Logo" />
</div>


PurrMind 是一款基于 uTools 平台的智能待办事项管理插件，提供高效的任务管理和 AI 智能解析功能。

## ✨ 功能特点

- 🎯 **智能任务解析**：通过 AI 将自然语言转换为结构化待办事项
- 📅 **时间管理**：支持截止日期、提醒时间设置
- 🏷️ **分类管理**：自定义分类和图标
- 🔍 **多种视图**：今天、计划、收藏、已完成等过滤方式
- ⏳ **时间轴展示**：直观展示任务时间线
- 🌈 **美观UI**：现代化界面设计，支持暗黑模式

## 🛠️ 技术栈

- 前端框架：React 19
- 构建工具：Vite
- UI组件：Radix UI + 自定义组件
- 样式：Tailwind CSS
- 数据存储：uTools dbStorage API
- AI功能：uTools AI API

## 🚀 安装使用

1. 确保已安装 [uTools](https://u.tools/)
2. 下载插件包或通过 uTools 应用商店安装
3. 在 uTools 中搜索 "PurrMind" 启动插件

## 📦 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build
```

## 📝 使用示例

1. 输入 "明天下午3点开会讨论项目进度"
2. AI 会自动解析为：
   - 标题：开会讨论项目进度
   - 截止时间：明天 15:00
3. 点击添加即可创建任务
