# API 手动测试指南

## 

本文档对应当前已经实现的后端接口，适用于 Postman、Thunder Client 等 HTTP 客户端。当前实现健康检查、登录认证、项目接口和项目任务查询/创建接口；任务更新和收藏接口尚未接入。

## 1. 启动服务

1. 确认数据库服务已启动，Prisma 数据库结构已同步，并且用于测试的用户记录已存在。
2. 在 `server/.env` 中配置数据库连接、JWT 签名密钥和本地开发用户密码：

   ```env
   DATABASE_URL="mysql://用户名:密码@localhost:3306/数据库名"
   AUTH_JWT_SECRET="至少 32 字节的随机字符串"
   SEED_USER_PASSWORD="本地开发用户的密码"
   PORT="3000"
   CLIENT_ORIGINS="http://localhost:5173"
   ```

   可使用 `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` 生成 `AUTH_JWT_SECRET`。不要将真实密钥或密码提交到 Git。首次准备本地开发用户时，在 PowerShell 中运行 `npm run seed:dev-user --prefix server`；该命令会创建或重置用户名为 `dev-user` 的账户密码。`CLIENT_ORIGINS` 是允许跨域访问 API 的前端 origin 列表，多个 origin 用逗号分隔，例如 `http://localhost:5173,https://app.example.com`。默认允许 Vite 本地开发 origin `http://localhost:5173`。
3. 在 `client/.env` 中配置前端 API 地址：

   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. 在项目根目录运行：

   ```powershell
   npm run dev:server
   ```

   服务默认运行在 `http://localhost:3000`。如果修改 `PORT`，也要同步修改 `client/.env` 中的 API 地址。更改 Vite 环境变量后需要重启前端开发服务器。

## 2. 通用约定

- 所有项目接口的基础地址为 `http://localhost:3000/api/projects`。
- 请求体为 JSON 时设置 `Content-Type: application/json`。
- 除健康检查和未匹配路由外，成功响应使用 `{ "success": true, "data": ... }`。
- 统一错误中间件响应使用 `{ "error": { "code": "...", "message": "..." } }`。
- 日期使用 `YYYY-MM-DD`；时间戳使用 UTC ISO 8601 格式。
- 项目 ID 和成员 ID 都是数据库中的数字 ID。
- 登录成功后服务端签发有效期为 1 小时的 JWT；项目和任务接口必须在 `Authorization: Bearer <token>` 请求头中携带 token。
- API 使用 Express CORS 中间件允许 `CLIENT_ORIGINS` 中的前端 origin；本地前端直接连接后端，不通过 Vite 代理。

## 3. 接口列表

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/api/health` | 检查服务是否启动 |
| POST | `/api/auth/login` | 用户名和密码登录 |
| GET | `/api/auth/me` | 获取当前登录用户 |
| GET | `/api/projects` | 查询当前用户参与的项目 |
| GET | `/api/projects/overview` | 查询当前用户的项目总览 |
| GET | `/api/projects/:projectId` | 查询项目详情 |
| GET | `/api/projects/:projectId/tasks` | 查询项目任务列表 |
| POST | `/api/projects/:projectId/tasks` | 创建项目任务 |
| POST | `/api/projects` | 创建项目 |
| PATCH | `/api/projects/:projectId` | 更新项目 |

## 4. 接口详情

### 4.1 登录

`POST /api/auth/login`

请求体：

```json
{
  "name": "dev-user",
  "password": "由 SEED_USER_PASSWORD 配置的密码"
}
```

成功响应（HTTP 200）中的 `data` 包含公开用户信息和 1 小时有效期的 JWT。密码哈希不会出现在响应中。

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "dev-user"
    },
    "token": "<JWT>"
  }
}
```

用户名或密码错误时返回 HTTP 401 和 `INVALID_CREDENTIALS`。请求体格式错误时返回 HTTP 400。

### 4.2 获取当前用户

`GET /api/auth/me`

请求头需要包含登录接口返回的 JWT：

```http
Authorization: Bearer <JWT>
```

返回当前用户公开信息，不包含密码哈希。缺少、无效或过期的 token 返回 HTTP 401。

### 4.3 健康检查

`GET /api/health`

不需要请求体，也不需要数据库数据。

成功响应（HTTP 200）：

```json
{
  "success": true,
  "message": "whenTeam server is running"
}
```

### 4.4 查询项目列表

`GET /api/projects`

返回当前登录用户作为项目成员的项目，按创建时间倒序排列。每个项目包含 `id`、`name`、`color`、`progress`、`taskCount` 和 `isFavorite`。收藏尚未接入，当前 `isFavorite` 固定为 `false`。

成功响应（HTTP 200）：

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "name": "接口测试项目",
      "color": "#9c55bd",
      "progress": 50,
      "taskCount": 4,
      "isFavorite": false
    }
  ]
}
```

没有项目时 `data` 是空数组。

### 4.5 查询项目总览

`GET /api/projects/overview`

成功响应（HTTP 200）：

```json
{
  "success": true,
  "data": {
    "projectCount": 2,
    "weekTaskCount": 3,
    "collaborators": [
      {
        "id": 1,
        "name": "测试用户",
        "avatarUrl": "https://example.com/avatar.png"
      },
      {
        "id": 2,
        "name": "其他成员"
      }
    ],
    "collaboratorCount": 2
  }
}
```

- `projectCount`：当前用户参与的项目数量。
- `weekTaskCount`：当前用户负责、截止日期在当前 UTC 周（周一开始、下周一不包含）、状态不是 `DONE`，且位于当前用户参与项目中的任务数。
- `collaborators`：当前用户所有项目中的去重成员，包含当前用户。没有头像的用户不返回 `avatarUrl`。
- `collaboratorCount`：去重后的成员数量。

### 4.6 查询项目详情

`GET /api/projects/:projectId`

例如：`GET /api/projects/12`

只有项目成员可以读取详情。项目不存在或当前用户不是成员时，均返回 HTTP 404。

成功响应（HTTP 200）：

```json
{
  "success": true,
  "data": {
    "id": 12,
    "name": "接口测试项目",
    "description": "用于手动验证项目接口",
    "color": "#9c55bd",
    "createdAt": "2026-10-23T02:00:00.000Z",
    "dueDate": "2026-11-30",
    "progress": 50,
    "taskCount": 4,
    "isFavorite": false,
    "members": [
      {
        "id": 1,
        "name": "测试用户"
      },
      {
        "id": 2,
        "name": "其他成员"
      }
    ]
  }
}
```

`progress` 是已完成任务（状态为 `DONE`）占全部任务的百分比，四舍五入为整数；没有任务时为 `0`。`description` 没有内容时返回空字符串。

### 4.7 查询项目任务列表

`GET /api/projects/:projectId/tasks`

例如：`GET /api/projects/12/tasks`

只有项目成员可以读取。项目不存在或当前用户不是项目成员时，返回 HTTP 404。任务按截止日期升序排列；截止日期相同则按创建时间倒序排列。

成功响应（HTTP 200）：

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "title": "实现项目详情页",
      "description": "加载真实项目与任务数据",
      "status": "DOING",
      "priority": "HIGH",
      "projectId": 12,
      "assignee": {
        "id": 1,
        "name": "测试用户"
      },
      "dueDate": "2026-10-28",
      "createdAt": "2026-10-23T02:00:00.000Z",
      "updatedAt": "2026-10-23T02:00:00.000Z"
    }
  ]
}
```

项目没有任务时，`data` 返回空数组。

### 4.8 创建项目任务

`POST /api/projects/:projectId/tasks`

请求体：

```json
{
  "title": "实现创建任务接口",
  "description": "为项目成员开放创建任务功能",
  "priority": "MEDIUM",
  "assigneeId": 1,
  "dueDate": "2026-11-20"
}
```

约束：

- 只有项目成员可以创建任务。
- `title`：去除首尾空格后不能为空，最多 200 个字符。
- `description`：可省略，最多 5000 个字符。
- `priority`：必须为 `LOW`、`MEDIUM` 或 `HIGH`。
- `assigneeId`：必须是当前项目成员的正整数 ID。
- `dueDate`：必须是有效的 `YYYY-MM-DD` 日期，不得早于当前 UTC 日期，也不得晚于项目截止日期。
- 任务状态由服务端默认设为 `TODO`；`projectId` 由 URL 指定，不在请求体中传入。
- 多传未定义字段会校验失败。

成功时返回 HTTP 201，`data` 为创建的 `TaskResponse`：

```json
{
  "success": true,
  "data": {
    "id": 102,
    "title": "实现创建任务接口",
    "description": "为项目成员开放创建任务功能",
    "status": "TODO",
    "priority": "MEDIUM",
    "projectId": 12,
    "assignee": {
      "id": 1,
      "name": "测试用户"
    },
    "dueDate": "2026-11-20",
    "createdAt": "2026-10-23T02:00:00.000Z",
    "updatedAt": "2026-10-23T02:00:00.000Z"
  }
}
```

常见失败：

| 情况 | HTTP 状态 | 错误码 |
| --- | --- | --- |
| 项目 ID 不是正整数 | 400 | `INVALID_PROJECT_ID` |
| 请求体格式或字段不合法 | 400 | `VALIDATION_ERROR` |
| 项目不存在或当前用户不是成员 | 404 | `PROJECT_NOT_FOUND` |
| 负责人不是项目成员 | 400 | `ASSIGNEE_NOT_PROJECT_MEMBER` |
| 任务截止日期早于今天 | 400 | `TASK_DUE_DATE_IN_PAST` |
| 任务截止日期晚于项目截止日期 | 409 | `TASK_DUE_DATE_CONFLICT` |



### 4.9 更新项目任务

`PATCH /api/tasks/:taskId`



`UpdateTaskRequest`



```
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  dueDate?: DateOnly;
}


{
  "title": "实现创建任务接口",
  "description": "为项目成员开放创建任务功能",
  "status": "TODO" | "DOING" | "DONE",
  "priority": "MEDIUM",
  "assigneeId": 1,
  "dueDate": "2026-11-20"
}

```





### 4.10 创建项目

`POST /api/projects`

请求体：

```json
{
  "name": "接口测试项目",
  "description": "用于手动验证项目接口",
  "dueDate": "2026-11-30",
  "memberIds": [2]
}
```

约束：

- `name`：去除首尾空格后不能为空，最多 100 个字符。
- `description`：可省略，最多 5000 个字符。
- `dueDate`：必须是有效的 `YYYY-MM-DD` 日期。
- `memberIds`：可为空数组，或最多 100 个正整数 ID。重复 ID 会被去重；创建者由服务端自动加入项目，因此无需在数组中指定创建者。
- 多传未定义字段会校验失败。

成功时返回 HTTP 201，`data` 是完整的项目详情，结构同“查询项目详情”。

常见失败：

| 情况 | HTTP 状态 | 错误码 |
| --- | --- | --- |
| 请求体格式或字段不合法 | 400 | `VALIDATION_ERROR` |
| 有成员 ID 不存在 | 400 | `MEMBER_NOT_FOUND` |

### 4.11 更新项目

`PATCH /api/projects/:projectId`

例如：`PATCH /api/projects/12`

可只提交需要修改的字段：

```json
{
  "name": "更新后的项目名称",
  "description": "更新后的说明",
  "dueDate": "2026-12-15",
  "memberIds": [2, 3]
}
```

约束：

- 至少提供一个可更新字段。
- `name`、`description`、`dueDate` 的格式要求与创建接口相同。
- `memberIds` 省略表示不修改成员；传入时会替换成员列表中的其他成员，项目创建者始终保留。允许传空数组，此时只保留创建者。
- 只有项目创建者可以更新。项目不存在或当前用户不是项目成员时返回 404；项目成员中的非创建者返回 403。
- 如果新项目截止日期早于已有任务的截止日期，更新失败。

成功时返回 HTTP 200，`data` 是更新后的完整项目详情。

常见失败：

| 情况 | HTTP 状态 | 错误码 |
| --- | --- | --- |
| 项目 ID 不是正整数 | 400 | `INVALID_PROJECT_ID` |
| 请求体格式不合法或没有可更新字段 | 400 | `VALIDATION_ERROR` |
| 项目不存在或当前用户不是成员 | 404 | `PROJECT_NOT_FOUND` |
| 当前用户不是项目创建者 | 403 | `PROJECT_FORBIDDEN` |
| 成员 ID 不存在 | 400 | `MEMBER_NOT_FOUND` |
| 新项目截止日期早于已有任务截止日期 | 409 | `PROJECT_DUE_DATE_CONFLICT` |

## 5. 推荐的手动测试顺序

建议先使用 Postman 或 Thunder Client 建立请求，并设置 `Content-Type: application/json`。先测成功流程，再测校验和权限边界。

1. **登录**：调用 `POST /api/auth/login`，确认返回用户信息和 token；错误密码应返回 HTTP 401。
2. **当前用户**：用登录返回的 token 调用 `GET /api/auth/me`，确认响应中只有公开用户信息。
3. **认证边界**：不带 token 或使用无效/过期 token 调用项目接口，预期 HTTP 401。
4. **健康检查**：调用 `GET /api/health`，确认服务可连接。
5. **列表与总览**：携带 `Authorization: Bearer <JWT>` 调用 `GET /api/projects` 和 `GET /api/projects/overview`，确认响应字段、空数组和统计值符合数据库数据。
6. **创建项目成功**：用一个有效且不同于当前登录用户的成员 ID 创建项目，记录响应中的项目 ID。
7. **创建校验用例**：分别测试空 `memberIds` 和只包含当前用户（都应成功创建并自动加入创建者），以及无效日期、额外字段和不存在的成员 ID。
8. **详情查询**：以创建项目时登录的账户查询刚创建的项目；检查详情中的成员、任务数和进度。
9. **更新成功**：以创建者修改名称或描述，再 GET 确认变更持久化；单独测试 `memberIds: []` 会保留创建者。
10. **权限验证**：使用项目的其他成员账户重新登录后尝试更新，预期 403；使用非成员查询详情，预期 404。
11. **创建任务**：项目成员调用 `POST /api/projects/:projectId/tasks`，确认任务状态默认为 `TODO`，任务出现在列表中，项目任务数和进度同步更新。
12. **任务创建校验**：测试不存在的项目、非项目成员负责人、无效日期，以及晚于项目截止日期的任务截止日期。
13. **任务列表**：调用 `GET /api/projects/:projectId/tasks`，确认项目成员可读取任务，非成员返回 404；项目无任务时应返回空数组。

如果测试失败，记录请求方法和 URL、请求体、HTTP 状态码和响应 JSON。排查时不要把数据库密码、JWT 密钥、密码或 token 贴出来。

## 6. 当前已知限制

- 目前只提供登录和当前用户查询；用户注册、密码修改/重置及 token 刷新尚未实现。开发账户由 `seed:dev-user` 脚本创建或重置。
- 任务列表查询和创建 API 已实现；更新和删除任务的 API 尚未实现。
- 收藏关系虽有数据库模型，但项目 API 尚未读取收藏数据，`isFavorite` 当前固定为 `false`。
- 未匹配的 URL 使用普通 404 响应：`{ "success": false, "error": { "code": "NOT_FOUND", "message": "接口不存在" } }`。
