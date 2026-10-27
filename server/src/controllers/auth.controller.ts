import type { RequestHandler } from "express";

import { login } from "../services/login.service.js";
import { register } from "../services/register.service.js";

import { loginSchema, registerSchema } from "../validations/auth.validation.js";

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


// 处理注册
export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await register(input);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};
