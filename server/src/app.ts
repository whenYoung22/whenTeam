import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import { authMiddleware } from "./middlewares/auth.middleware.js";
import { errorMiddleware } from "./middlewares/error.middlerware.js";
import { getClientOrigins } from "./utils/client-origins.util.js";

const app = express();

app.use(cors({ origin: getClientOrigins(), credentials: true }));

app.use(express.json());

// 全局请求日志
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    console.log(
      `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`,
    );
  });
  next();
});


/*****注册和登录不需要走鉴权中间件，需要最先注册⚠️*********/
app.use("/api/auth", authRoutes);


// 对以下所有路由 鉴权
app.use("/api", authMiddleware);

// 用户查询接口
app.use("/api", userRoutes);

// 项目
app.use("/api/projects", projectRoutes);

// 任务
app.use("/api", taskRoutes);

// 通知
app.use("/api/notifications", notificationRoutes);

// 处理 404 的普通中间件 如果请求走到了这里，说明前面的路由都没匹配上
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "接口不存在" }
  });
});


// ⚠️ 全局错误处理中间件（必须是最后一个！）
// 只有当前面的路由调用了 next(error) 或抛出了异常，才会进入这里
app.use(errorMiddleware);

export default app;
