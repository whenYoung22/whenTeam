# whenTeam

一个基于 React + TypeScript + Express 的轻量级团队项目与任务协作平台，用于实践全栈开发与前后端分离架构。

## 技术选型

| 模块           | 技术                         |
| -------------- | ---------------------------- |
| 前端           | React、TypeScript、Vite      |
| UI 组件        | Ant Design                   |
| 路由与状态管理 | React Router、Zustand        |
| HTTP 请求      | Axios                        |
| 后端           | Node.js、Express、TypeScript |
| 数据库         | MySQL、Prisma ORM            |
| 身份认证       | JWT                          |
| 实时通信       | WebSocket                    |
| 版本管理       | Git                          |

## 项目结构

```
whenTeam/
├── client/              # React 前端
│   └── src/
│       ├── api/         # HTTP 请求
│       ├── components/  # 公共组件
│       ├── hooks/       # 自定义 Hooks
│       ├── pages/       # 页面
│       ├── router/      # 路由配置
│       ├── stores/      # 全局状态
│       ├── types/       # 前端类型
│       └── utils/       # 工具函数
├── server/              # Express 后端
│   ├── prisma/          # 数据模型与迁移
│   └── src/
│       ├── config/      # 配置
│       ├── controllers/ # 请求处理
│       ├── middleware/  # 中间件
│       ├── routes/      # 路由
│       ├── services/    # 业务逻辑
│       └── websocket/   # 实时通信
├── shared/              # 前后端共享类型与常量
├── docs/                # 项目文档
└── package.json         # 根目录开发脚本
```

## 核心功能

+ **用户认证**：登录、退出及身份验证。
+ **项目管理**：查看项目列表、查看项目详情、创建项目。
+ **任务管理**：创建、编辑、删除任务，修改任务状态和优先级。
+ **实时通知**：通过 WebSocket 推送任务状态变更通知。

### 任务属性

+ 状态：`TODO`、`DOING`、`DONE`
+ 优先级：`LOW`、`MEDIUM`、`HIGH`

