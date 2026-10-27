import { Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller.js";

const router = Router();

// POST /api/auth/login 登录
router.post("/login", loginController);

// POST /api/auth/register 注册
router.post("/register", registerController);

export default router;
