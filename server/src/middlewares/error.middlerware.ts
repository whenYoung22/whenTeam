import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { sendError } from "../utils/response.util.js";
import { AppError } from "../utils/AppError.util.js";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1. 如果是我们已经主动抛出的业务错误
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode);
  }

  // 2. 如果是 Zod 校验没通过（用户输入格式不对）
  if (err instanceof ZodError) {
    // 把 Zod 的复杂报错数组，提炼成一句好懂的话
    const message = err.issues.map((i) => i.message).join("; ");
    return sendError(res, "VALIDATION_ERROR", message, 400);
  }

  // 3. 如果是 Prisma 数据库报错（比如唯一索引冲突、外键约束）
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return sendError(res, "DUPLICATE_ENTRY", "数据已存在", 409);
    }
    // 其他数据库错误...
  }

  // 4. 真正的兜底：未知错误（比如代码里写了 undefined.xxx）
  console.error("💥 Unhandled Error:", err);
  return sendError(res, "INTERNAL_SERVER_ERROR", "服务器内部错误", 500);
};