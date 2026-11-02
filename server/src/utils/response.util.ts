import type { Response } from "express";
import type { ApiSuccessResponse, ApiErrorResponse } from "../../../shared/common/api.js";
import {
  errorDictionary,
  type ErrorCode,
} from "./errorDictionary.util.js";

// 成功响应包装器
export function sendSuccess<T>(res: Response, data: T, status = 200) {
  const body: ApiSuccessResponse<T> = { success: true, data };
  return res.status(status).json(body);
}

// 失败响应包装器
export function sendError(
  res: Response,
  code: ErrorCode,
  message: string = errorDictionary[code].message,
  status = errorDictionary[code].statusCode,
) {
  const body: ApiErrorResponse = {
    error: { code, message },
  };
  return res.status(status).json(body);
}