import { Router } from "express";
import {
  getCurrentUserController,
  getUsersController,
} from "../controllers/user.controller.js";

const router = Router();

// GET /api/me 查询当前用户
router.get("/me", getCurrentUserController);

// GET /api/users 查询可公开展示的用户列表
router.get("/users", getUsersController);

export default router;
