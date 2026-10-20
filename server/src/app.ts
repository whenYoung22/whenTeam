import express from "express";

const app = express();

// 解析 JSON 请求体
app.use(express.json());

// 临时健康检查接口
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "whenTeam server is running",
  });
});

export default app;