import { Router } from "express";
import {
  createProjectController,
  favoriteProjectController,
  getProjectController,
  getProjectOverviewController,
  getProjectsController,
  updateProjectController,
  unfavoriteProjectController,
} from "../controllers/project.controller.js";

const router = Router();

// Must precede /:projectId so "overview" is treated as a fixed endpoint.
// GET /api/projects/overview
router.get("/overview", getProjectOverviewController);

// GET /api/projects 查询当前用户的项目列表
router.get("/", getProjectsController);

// POST /api/projects 创建项目
router.post("/", createProjectController);

// PUT /api/projects/:projectId/favorite
router.put("/:projectId/favorite", favoriteProjectController);

// DELETE /api/projects/:projectId/favorite
router.delete("/:projectId/favorite", unfavoriteProjectController);

// GET /api/projects/:projectId 查询项目详情
router.get("/:projectId", getProjectController);

// PATCH /api/projects/:projectId 更新项目信息
router.patch("/:projectId", updateProjectController);

export default router;
