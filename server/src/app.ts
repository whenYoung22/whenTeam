import express from "express";

import { devAuth } from "./middlewares/dev-auth.js";

import projectRoutes from "./routes/project.routes.js";

import { errorMiddleware } from "./middlewares/error.middlerware.js";

const app = express();

app.use(express.json());

// 临时健康检查接口
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "whenTeam server is running",
  });
});


// Project 接口暂时使用开发身份
app.use("/api/projects", devAuth, projectRoutes);

// 处理 404 的普通中间件 如果请求走到了这里，说明前面的路由都没匹配上
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "接口不存在" }
  });
});


// ⚠️ 全局错误处理中间件（必须是最后一个！）
// 只有当前面的路由调用了 next(error) 或抛出了异常，才会进入这里
app.use(errorMiddleware);

export default app;
