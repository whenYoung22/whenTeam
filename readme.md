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
│       ├── service/     # 封装axios实例
│       ├── assets/      # 静态资源
│       ├── components/  # 公共组件
│       ├── hooks/       # 自定义 Hooks
│       ├── pages/       # 页面
│       ├── router/      # 路由配置
│       ├── stores/      # 全局状态
│       ├── clientTypes/ # 前端类型
│       ├── App.tsx
│       └── main.tsx
│
│    
├── server/              # Express 后端
│   ├── prisma/          # 数据模型与迁移
│   └── src/
│       ├── config/      # 配置
│       ├── controllers/ # 请求处理 接收req，调用service，调用mapper，返回res
│       ├── lib/         # Prisma Client等共享基础实例; 集中创建实例，再由其他模块导入使用
│       ├── generated/   # 自动生成的prisma客户端代码
│       ├── mappers/     # 专门放所有toXXXDTO转换函数
│       ├── middlewares/ # 中间件 鉴权、cors、错误捕获这类express中间件
│       ├── routes/      # API路由
│       ├── validations/ # 请求参数的运行时校验 Zod
│       ├── serverType/  # 后端专属类型
│       ├── services/    # 业务逻辑，数据库操作
│       ├── websocket/   # 实时通信
│       ├── app.ts       # 创建 Express 应用、注册中间件和路由
│       └── server.ts    # 启动 HTTP 服务、处理生命周期
│
│
├── shared/              # 前后端共享类型与常量
├── docs/                # 项目文档
└── package.json         # 根目录开发脚本
```



### server调用流程

> routes → controller → service 拿到数据库原始 row → mapper 转 DTO → 返回前端



## 核心功能

+ **用户认证**：登录、退出及身份验证。
+ **项目管理**：查看项目列表、查看项目详情、创建项目。
+ **任务管理**：创建、编辑、删除任务，修改任务状态和优先级。
+ **实时通知**：通过 WebSocket 推送任务状态变更通知。





## 任务属性

+ 状态：`TODO`、`DOING`、`DONE`
+ 优先级：`LOW`、`MEDIUM`、`HIGH`

## 前后端 API 契约

前后端共享类型集中在 `shared/`，客户端 mock 数据也必须符合这些响应类型。组件表单的类型（例如 Ant Design 使用的 `Dayjs`）只属于前端，提交前需转换成契约格式。



### 通用约定

- ID 使用数字。
- `DateOnly` 使用 `YYYY-MM-DD`，用于截止日期等日历日期。
- `IsoDateTime` 使用 UTC ISO 8601 格式 `YYYY-MM-DDTHH:mm:ss.sssZ`，用于创建和更新时间。响应中传字符串，不传 JavaScript `Date`。
- 任务状态和优先级使用大写枚举值；中文标签和 UI 样式只在前端映射。
- 成功响应使用 `{ "data": ... }`；错误响应使用 `{ "error": { "code": "...", "message": "..." } }`。
- 这些 TypeScript 类型不会在运行时校验请求；服务端需在 `validations/` 中校验输入和日期格式。



### 核心响应和请求

- `Project` 表示项目基础数据；项目 `color` 由服务端生成，创建请求不传颜色。
- `ProjectListItem`、`ProjectDetailResponse`、`ProjectOverviewResponse` 是查询响应。进度、任务数、收藏状态和总览统计是查询/用户上下文数据，不是项目表字段。
- 创建项目使用 `CreateProjectRequest`，`memberIds` 可为空；服务端会自动将创建者加入项目，响应为完整的 `ProjectDetailResponse`。
- 项目详情只对项目成员开放；目前只有创建者可以更新项目。更新成员列表时按传入列表替换其他成员，创建者始终保留。
- 项目总览的 `weekTaskCount` 统计当前用户作为负责人、截止日期在 UTC 周一至下周一（不含）之间且状态不是 `DONE` 的任务，并限定在当前用户参与的项目中。协作者按所有这些项目的成员去重统计，包含当前用户。
- 收藏功能尚未接入后端；为保留现有前端 mock 和收藏筛选，shared 类型暂时仍包含 `isFavorite`，后端项目响应目前统一返回 `false`。
- 项目截止日期必填，创建和更新时都不能传 `null`。
- `Task` 表示任务基础数据，负责人关联使用 `assigneeId`；`TaskResponse` 面向前端并包含 `assignee` 用户摘要。
- 创建、更新任务分别使用 `CreateTaskRequest`、`UpdateTaskRequest`。创建任务所属项目由项目路由确定，不在请求体重复传 `projectId`。
- 项目成员可以创建任务；任务负责人必须是该项目成员。任务状态由服务端默认设为 `TODO`。
- 项目成员可以更新所属项目的任务；更新任务通过 `PATCH /api/tasks/:taskId`，任务列表和创建任务仍通过项目路径访问。
- 任务截止日期和负责人必填；更新时可以省略对应字段表示不修改，但不能传 `null` 清空。
- 任务截止日期不得晚于所属项目的截止日期。创建和更新任务时，服务端业务逻辑都必须比较这两个日期；前端表单也会限制可选日期，但不能用前端限制替代服务端检查。
- 创建任务时状态由服务端默认设为 `TODO`；客户端通过更新请求修改状态。
- 收藏建议使用独立的用户-项目多对多关联表（例如 `ProjectFavorite`），以 `(userId, projectId)` 唯一约束避免重复收藏；`isFavorite` 由服务端针对当前用户查询并放入响应，不是项目表字段。
- `UserRecord` 是后端内部类型，密码只以 `passwordHash` 保存，不能作为 API 响应返回。

接口可以按以下资源组织；具体路由实现时以这些共享请求/响应类型为准：

| 操作 | 方法与路径 | 请求体 | 成功数据 |
| --- | --- | --- | --- |
| 获取项目总览 | `GET /api/projects/overview` | — | `ProjectOverviewResponse` |
| 获取项目列表 | `GET /api/projects` | — | `ProjectListItem[]` |
| 获取项目详情 | `GET /api/projects/:projectId` | — | `ProjectDetailResponse` |
| 创建项目 | `POST /api/projects` | `CreateProjectRequest` | `ProjectDetailResponse` |
| 更新项目 | `PATCH /api/projects/:projectId` | `UpdateProjectRequest` | `ProjectDetailResponse` |
| 获取项目任务 | `GET /api/projects/:projectId/tasks` | — | `TaskResponse[]` |
| 创建项目任务 | `POST /api/projects/:projectId/tasks` | `CreateTaskRequest` | `TaskResponse` |
| 更新任务 | `PATCH /api/tasks/:taskId` | `UpdateTaskRequest` | `TaskResponse` |




## 数据模型

### User

```text
id
name
avatarUrl
```

密码哈希属于后端内部 `UserRecord`，不属于公开用户数据。

### Project

```text
id
name
description
color
createdAt
dueDate
```

项目成员关系单独关联用户；`progress`、`taskCount`、`isFavorite` 属于 API 查询结果，不是项目表字段。

### ProjectFavorite

```text
userId
projectId
createdAt
```

`(userId, projectId)` 应设为联合唯一键。收藏关系与项目成员关系是两种不同关系：收藏表示某个用户的个人偏好，不自动意味着该用户是项目成员。

### Task

```text
id
title
description
status
priority
projectId
assigneeId
dueDate
createdAt
updatedAt
```

### Notification

```text
id
creatorId
creatorName
receiverId
content
projectId
isRead
createdAt
```



> 