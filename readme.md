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
+ **项目管理**：查看项目列表、查看项目详情、创建、编辑和删除项目。
+ **任务管理**：创建、编辑、删除任务，修改任务状态和优先级。
+ **通知管理**：查看通知和未读数；删除项目或任务后向其他项目成员发送通知。
+ **实时通知**：通过 WebSocket 向在线用户推送通知变更，通知内容仍通过受 JWT 保护的 REST 接口读取。

### WebSocket 通知

- 客户端连接 `ws(s)://<server>/ws` 后，发送 `{ "type": "auth", "token": "<access token>" }` 完成认证。
- 认证成功后服务端发送 `{ "type": "ready" }`；新通知持久化且事务提交后，向对应用户发送 `{ "type": "notification.created" }`。
- 收到通知事件或重新连接成功后，客户端通过 REST 接口刷新通知和未读数。离线期间的通知保存在数据库中，不依赖 WebSocket 补发。
- 当前连接管理为单服务实例内存状态；多实例部署需要共享连接路由方案。



## 实战里必须知道的"坑"（重点）

这些是教科书不强调、但一写就踩的：

### 1. 连接是有状态的 → 服务器要管连接表

每个连接是一个对象，服务器得自己维护"谁在线""这个连接属于哪个用户"。

> 你代码里的 `connectionsByUserId: Map<userId, Set<WebSocket>>` 就是干这个的。HTTP 不需要，WS 必须。

### 2. 需要心跳保活（ping/pong）

长连接经过 NAT、负载均衡、代理时，可能被**静默掐断**，但两端 `readyState` 还显示 OPEN，你以为连着其实早断了。

+ 解决：服务器定时 `ping()`，客户端回 `pong`，超时没回就 `terminate()`。
+ 浏览器端 JS 拿不到 ping/pong 帧（协议层自动回），所以前端常用**应用层心跳**（定时发个 `{type:"ping"}`）。

### 3. 断线重连要自己实现

网络抖动、手机切后台、服务器重启都会断。**WS 没有自动重连**，前端必须写：

+ `onclose` 后延迟重连（指数退避）
+ 重连后**重新认证**（你代码里 token 是首条消息发的，重连就得重发）
+ 处理"重连期间漏掉的消息"（通常靠重连后拉一次全量/增量补偿）

### 4. 多实例部署是最大坑

`connectionsByUserId` 是**进程内存**。部署 3 个 pod：

+ 用户连在 A，通知由 B 产生 → B 的内存表里没这个用户 → **推不到**。
+ 解决：用 **Redis Pub/Sub / 消息队列**广播，每个实例订阅后推给自己本地连接。

> 这是你这段代码上生产前**必须补**的一环。

### 5. 鉴权不能只靠握手时的 Cookie/Header

+ 浏览器 `WebSocket` 构造函数**不能自定义 Header**，也不能方便地设 Cookie（同源会自动带）。
+ 所以常见做法就是**先连上，再用第一条消息带 token 认证**（你代码的做法），或 token 放 query（不推荐，会进日志）。
+ 必须防 **CSWSH（跨站 WebSocket 劫持）**：WS 不受同源策略保护，攻击者页面可发起连接并自动带 Cookie。所以要**校验 Origin**（你代码的 `verifyClient` 就是）。

### 6. 消息没有"请求-响应"语义

HTTP 有天然的"这个响应对应这个请求"。WS 是流，**你得自己在消息里加 id/type 来区分**。

> 你代码里 `{type:"auth"}`、`{type:"ready"}`、`{type:"notification.created"}` 就是这个思路——**协议要自己定**。

### 7. 消息大小和频率要限制

+ 设 `maxPayload`（你设了 1KB）防大包。
+ 限频率，防单连接刷爆服务器。
+ 注意**背压**：客户端收得慢，`bufferedAmount` 会涨，必要时断开。



```
客户端 --ws://host/ws--> WebSocketServer
                          │
                  verifyClient(校验 Origin)
                          │
                    connection 事件
                          │
              等待客户端发 {type:"auth", token}
                          │
                  verifyAccessToken(token)
                          │
              成功 → 存入连接表 → 回 {type:"ready"}
              失败 → 关闭连接(code 4401)
                          │
             业务代码调用 publishNotificationChanges(userIds)
                          │
              给这些 userId 的所有连接推送 notification.created
              
              
① 前端 new WebSocket("wss://host/ws")
        │
② 握手（HTTP Upgrade）+ 服务器校验 Origin
        │
③ 连上后：前端立即发 {type:"auth", token}
        │
④ 服务器 verifyAccessToken → 登记连接表 → 回 {type:"ready"}
        │
⑤ 保持：定时 ping/pong 保活
        │
⑥ 业务推：服务器 publish → 遍历该用户连接 send
        │
⑦ 断开：onclose → 前端指数退避重连 → 回到 ③


/**********
WebSocket 收到消息
      │
      ▼
notifyNotificationsChanged()        ← 发布者（发信号）
      │ window.dispatchEvent
      ▼
window 事件总线（EventTarget）
      │
      ▼
subscribeToNotificationChanges(fn)  ← 订阅者（组件监听）
      │ fn 被调用
      ▼
组件重新拉 HTTP 数据
```

1. **握手借 HTTP，之后是独立协议**，所以能和 HTTP 共端口。
2. **有状态**：服务器必须自己维护连接表（按 userId 归类）。
3. **必须心跳 + 重连 + 重连后重新认证**。
4. **多实例要 Redis 广播**，否则跨实例推不到。
5. **鉴权靠首条消息 + 校验 Origin**，防 CSWSH。



#### 可改进点

1. **心跳保活缺失**：没有 ping/pong。经过 NAT/代理的长连接可能被静默断开，`readyState` 仍显示 OPEN，推送会失败。建议加 `setInterval` 定期 `socket.ping()`，超时未 `pong` 则 `terminate()`。
2. **单进程内存态**：`connectionsByUserId` 是进程内 Map，**多实例部署时**（如多 pod）某用户连在 A 实例，但通知由 B 实例触发 → 推不到。生产需借助 **Redis Pub/Sub 或消息队列**做跨实例广播。
3. **`verifyClient` 的 `!origin` 放行**：安全性弱一些，若非浏览器客户端也有办法带 Origin/自定义头，可结合 token 校验在握手阶段（`upgrade` 事件）做更严的校验。
4. **`isClientMessage` 冗余判断**：`"type" in value && value.type === "auth"` 中前半句可省（`=== "auth"` 已隐含存在），无功能问题。
5. **错误日志无上下文**：建议日志里带上 `userId`、连接标识，便于排查。
6. **推送无背压处理**：若客户端接收慢，`send` 会堆积在缓冲区。可检查 `socket.bufferedAmount`，超阈值则断开或丢弃。
7. **`connectionsByUserId` 跨实例/测试隔离**：模块级全局变量在测试中会串数据，可考虑注入或提供 reset 钩子。



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
- 收藏通过独立的 `ProjectFavorite` 用户-项目关联表持久化，`isFavorite` 按当前用户写入项目响应。
- 项目截止日期必填，创建和更新时都不能传 `null`。
- `Task` 表示任务基础数据，负责人关联使用 `assigneeId`；`TaskResponse` 面向前端并包含 `assignee` 用户摘要。
- 创建、更新任务分别使用 `CreateTaskRequest`、`UpdateTaskRequest`。创建任务所属项目由项目路由确定，不在请求体重复传 `projectId`。
- 项目成员可以创建任务；任务负责人必须是该项目成员。任务状态由服务端默认设为 `TODO`。
- 任务负责人可以更新自己的任务；项目创建者可以处理负责人已被移出项目的孤儿任务。更新任务通过 `PATCH /api/tasks/:taskId`，任务列表和创建任务仍通过项目路径访问。
- 任务截止日期和负责人必填；更新时可以省略对应字段表示不修改，但不能传 `null` 清空。
- 任务截止日期不得晚于所属项目的截止日期。创建和更新任务时，服务端业务逻辑都必须比较这两个日期；前端表单也会限制可选日期，但不能用前端限制替代服务端检查。
- 创建任务时状态由服务端默认设为 `TODO`；客户端通过更新请求修改状态。
- 收藏使用独立的用户-项目多对多关联表 `ProjectFavorite`，以 `(userId, projectId)` 唯一约束避免重复收藏；`isFavorite` 由服务端针对当前用户查询并放入响应，不是项目表字段。
- `UserRecord` 是后端内部类型，密码只以 `passwordHash` 保存，不能作为 API 响应返回。

接口可以按以下资源组织；具体路由实现时以这些共享请求/响应类型为准：

| 操作 | 方法与路径 | 请求体 | 成功数据 |
| --- | --- | --- | --- |
| 获取项目总览 | `GET /api/projects/overview` | — | `ProjectOverviewResponse` |
| 获取项目列表 | `GET /api/projects` | — | `ProjectListItem[]` |
| 获取项目详情 | `GET /api/projects/:projectId` | — | `ProjectDetailResponse` |
| 创建项目 | `POST /api/projects` | `CreateProjectRequest` | `ProjectDetailResponse` |
| 更新项目 | `PATCH /api/projects/:projectId` | `UpdateProjectRequest` | `ProjectDetailResponse` |
| 删除项目 | `DELETE /api/projects/:projectId` | — | — |
| 收藏项目 | `PUT /api/projects/:projectId/favorite` | — | `{ isFavorite: true }` |
| 取消收藏 | `DELETE /api/projects/:projectId/favorite` | — | `{ isFavorite: false }` |
| 获取项目任务 | `GET /api/projects/:projectId/tasks` | — | `TaskResponse[]` |
| 创建项目任务 | `POST /api/projects/:projectId/tasks` | `CreateTaskRequest` | `TaskResponse` |
| 更新任务 | `PATCH /api/tasks/:taskId` | `UpdateTaskRequest` | `TaskResponse` |
| 删除任务 | `DELETE /api/tasks/:taskId` | — | — |
| 获取通知 | `GET /api/notifications` | — | `NotificationListResponse` |
| 获取未读数 | `GET /api/notifications/unread-count` | — | `number` |
| 标记通知已读 | `PATCH /api/notifications/:notificationId/read` | — | `{ isRead: true }` |
| 全部标记已读 | `POST /api/notifications/read-all` | — | `{ isRead: true }` |




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
type
creatorId
creatorName
receiverId
content
projectId (nullable)
taskId (nullable)
isRead
createdAt
```









