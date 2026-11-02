import type { RequestHandler } from "express";

import { errors } from "jose";

import { verifyAccessToken } from "../utils/access-token.util.js";
import { AppError } from "../utils/AppError.util.js";

// 鉴权中间件
export const authMiddleware: RequestHandler = async (req, res, next) => {
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];

  if (!token) {
    next(new AppError("AUTH_REQUIRED"));
    return;
  }

  try {
    res.locals.userId = await verifyAccessToken(token);
    next();
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      next(new AppError("INVALID_TOKEN"));
      return;
    }

    next(error);
  }
};
