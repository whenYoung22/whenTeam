```
whenTeam/
├── client/                            # React 前端
│   ├── public/
│   ├── src/
│   │   ├── assets/                    # 静态资源
│   │   ├── components/                # 通用组件
│   │   ├── pages/                     # 页面
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ProjectListPage.tsx
│   │   │   └── ProjectDetailPage.tsx
│   │   ├── router/                    # 路由配置
│   │   ├── api/                       # HTTP 请求与接口封装
│   │   │   ├── http.ts
│   │   │   ├── auth.ts
│   │   │   ├── project.ts
│   │   │   └── task.ts
│   │   ├── stores/                    # Zustand 全局状态
│   │   │   └── authStore.ts
│   │   ├── hooks/                     # 自定义 Hooks
│   │   ├── types/                     # 前端专属类型
│   │   ├── utils/                     # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                            # Express 后端
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/                    # 环境变量与配置
│   │   ├── routes/                    # API 路由
│   │   ├── controllers/               # 请求与响应处理
│   │   ├── services/                  # 业务逻辑
│   │   ├── middleware/                # 认证、错误处理
│   │   ├── validators/                # 请求参数校验
│   │   ├── lib/                       # Prisma 等实例
│   │   ├── utils/                     # 后端工具函数
│   │   ├── websocket/                 # WebSocket 实时通信
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                            # 前后端共享代码
│   ├── types/                         # 共享数据类型
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── task.ts
│   │   └── notification.ts
│   ├── constants/                     # 共享常量与枚举
│   │   ├── task.ts
│   │   └── api.ts
│   └── index.ts                       # 统一导出
│
├── docs/
│   ├── PRD.md
│   ├── API.md
│   └── ARCHITECTURE.md
│
├── .gitignore
├── README.md
└── package.json                       # 可选：根目录脚本
```

