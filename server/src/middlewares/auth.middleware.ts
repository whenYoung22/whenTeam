import type { RequestHandler } from "express";

import { errors } from "jose";

import { verifyAccessToken } from "../utils/auth-token.util.js";
import { AppError } from "../utils/AppError.util.js";

// 鉴权中间件
export const authMiddleware: RequestHandler = async (req, res, next) => {
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];

  if (!token) {
    next(new AppError(401, "AUTH_REQUIRED", "请先登录"));
    return;
  }

  try {
    res.locals.userId = await verifyAccessToken(token);
    next();
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      next(new AppError(401, "INVALID_TOKEN", "登录状态无效或已过期"));
      return;
    }

    next(error);
  }
};
