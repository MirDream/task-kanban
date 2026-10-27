# 任务看板 Task Kanban

一个基于 **Vue3 + Vite + localStorage** 的纯前端任务管理看板。无需后端与数据库，双击即用，所有数据保存在浏览器本地。

## 项目简介

用三列看板承载「待办 → 进行中 → 已完成」的任务流转：新建任务时可自定义标题、描述与分类，卡片支持在任意列之间双向拖拽，顶部可按分类标签快速筛选，全部操作自动写入 localStorage，刷新页面或重新打开浏览器数据都不会丢失。

## 核心功能

| 能力 | 说明 |
| --- | --- |
| 三列看板 | 待办 / 进行中 / 已完成，列头实时显示任务数 |
| 双向拖拽 | 卡片可在任意两列之间拖动流转，拖拽过程有投放高亮反馈 |
| 任务卡片 | 自定义标题、描述、分类标签；双击卡片即可编辑 |
| 分类筛选 | 按分类标签一键过滤，标签后带任务计数 |
| 关键词搜索 | 同时匹配标题与描述，可与分类筛选叠加 |
| 本地持久化 | 增删改与拖拽结果自动写入 localStorage，刷新不丢失 |
| 多主题 | 浅色 / 深色 / 暖沙三套主题，主题选择同样被持久化 |
| 容错降级 | localStorage 数据损坏或不可用时自动回落默认状态，不白屏 |

## 技术栈

- **Vue 3**（`<script setup>` 组合式 API）
- **Vite 5**（开发服务器与构建）
- **localStorage**（无后端持久化）
- **原生 HTML5 Drag & Drop**（不引入拖拽库）

## 快速开始

```bash
npm install
npm run dev      # 开发预览 http://127.0.0.1:5173
npm run build    # 产出 dist/
npm run preview  # 预览构建产物
```

## 目录结构

```
task-kanban/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js                 # 应用入口
    ├── App.vue                 # 页面骨架：头部/统计/筛选/三列看板
    ├── assets/main.css         # 主题变量与全局样式
    ├── components/
    │   ├── KanbanColumn.vue    # 单列容器：接收投放、空态提示、列内新建
    │   ├── TaskCard.vue        # 任务卡片：展示、拖拽源、左右移动、删除
    │   └── TaskModal.vue       # 新建/编辑弹窗：标题、描述、分类、状态
    ├── composables/
    │   └── useKanban.js        # 状态中枢：增删改查、拖拽移动、统计、持久化
    └── utils/
        └── storage.js          # localStorage 读写与异常降级
```

## 数据模型

```js
{
  tasks: [
    {
      id: 't_xxx',          // 唯一标识
      title: '梳理赛题需求',  // 标题（≤60 字）
      desc: '……',            // 描述（≤240 字，可空）
      category: '产品',      // 分类标签
      status: 'todo',       // todo | doing | done
      createdAt: 1730000000000,
      updatedAt: 1730000000000
    }
  ],
  theme: 'light'            // light | dark | sand
}
```

存储键：`task-kanban.v1`。

## 自测要点

1. 新建任务后切到「进行中」，卡片出现在目标列；
2. 把卡片从「已完成」拖回「待办」，列头计数同步变化；
3. 点击分类标签，仅显示该分类任务；
4. 刷新页面，任务、位置、主题均保持不变；
5. 手动把 localStorage 的 `task-kanban.v1` 改成非法 JSON，刷新后页面回落默认数据而不报错。

## 说明

本项目为第十一届华为 ICT 大赛云赛道「赛题1：AI应用开发-发布作品领取激励」的实践作品，全部代码在 AI 对话中生成，发布至华为云开发者作品展览馆。
