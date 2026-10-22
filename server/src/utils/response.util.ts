import type { Response } from "express";
import type { ApiSuccessResponse, ApiErrorResponse } from "../../../shared/common/api.js";

// 成功响应包装器
export function sendSuccess<T>(res: Response, data: T, status = 200) {
  const body: ApiSuccessResponse<T> = { success: true, data };
  return res.status(status).json(body);
}

// 失败响应包装器
export function sendError(res: Response, code: string, message: string, status = 400) {
  const body: ApiErrorResponse = {
    error: { code, message },
  };
  return res.status(status).json(body);
}