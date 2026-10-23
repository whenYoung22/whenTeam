import { Router } from "express";
import {
  createProjectController,
  getProjectController,
  getProjectOverviewController,
  getProjectsController,
  updateProjectController,
} from "../controllers/project.controller.js";
import {
  createProjectTaskController,
  getProjectTasksController,
} from "../controllers/task.controller.js";

const router = Router();

// Must precede /:projectId so "overview" is treated as a fixed endpoint.
// GET /api/projects/overview
router.get("/overview", getProjectOverviewController);

// GET /api/projects 查询当前用户的项目列表
router.get("/", getProjectsController);

// POST /api/projects 创建项目
router.post("/", createProjectController);

// GET /api/projects/:projectId/tasks 查询项目任务
router.get("/:projectId/tasks", getProjectTasksController);

// POST /api/projects/:projectId/tasks 创建项目任务
router.post("/:projectId/tasks", createProjectTaskController);

// GET /api/projects/:projectId 查询项目详情
router.get("/:projectId", getProjectController);

// PATCH /api/projects/:projectId 更新项目信息
router.patch("/:projectId", updateProjectController);

export default router;
