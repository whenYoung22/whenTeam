import type { RequestHandler } from "express";

import { login } from "../services/login.service.js";

import { loginSchema } from "../validations/auth.validation.js";

import { sendSuccess } from "../utils/response.util.js";

// 处理登录
export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await login(input);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};
