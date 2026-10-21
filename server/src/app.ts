
import express from "express";
import { devAuth } from "./middlewares/dev-auth.js";
import projectRoutes from "./routes/project.routes.js";

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

export default app;
