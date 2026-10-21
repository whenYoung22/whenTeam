import { Router } from "express";
import { createProjectController, getProjectsController } from "../controllers/project.controller.js";

const router = Router();

// GET /api/projects：查询当前用户的项目列表
router.get("/", getProjectsController);

// POST /api/projects：创建项目
router.post("/", createProjectController);

export default router;
