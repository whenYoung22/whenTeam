import { Router } from "express";
import { getCurrentUserController } from "../controllers/user.controller.js";

const router = Router();

// GET /api/auth/me 查询当前用户
router.get("/me", getCurrentUserController);

export default router;
