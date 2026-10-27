import { Router } from "express";
import { loginController } from "../controllers/auth.controller.js";

const router = Router();

// POST /api/auth/login 登录
router.post("/login", loginController);

export default router;
