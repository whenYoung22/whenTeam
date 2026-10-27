import { Router } from "express";
import {
  createProjectTaskController,
  getProjectTasksController,
  updateTaskController,
} from "../controllers/task.controller.js";

const router = Router();

// GET /api/projects/:projectId/tasks 查询项目任务
router.get("/projects/:projectId/tasks", getProjectTasksController);

// POST /api/projects/:projectId/tasks 创建项目任务
router.post("/projects/:projectId/tasks", createProjectTaskController);

// PATCH /api/tasks/:taskId 更新任务
router.patch("/tasks/:taskId", updateTaskController);

export default router;
