import { Router } from "express";
import {
  logoutController,
  loginController,
  refreshController,
  registerController,
} from "../controllers/auth.controller.js";

const router = Router();

// POST /api/auth/login 登录
router.post("/login", loginController);

// POST /api/auth/register 注册
router.post("/register", registerController);

// POST /api/auth/refresh 使用 Refresh Token Cookie 轮换令牌
router.post("/refresh", refreshController);

// POST /api/auth/logout 撤销当前登录会话
router.post("/logout", logoutController);

export default router;
