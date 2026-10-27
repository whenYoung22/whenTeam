import type { RequestHandler } from "express";

import { getCurrentUser } from "../services/user.service.js";

import { sendSuccess } from "../utils/response.util.js";


// 获取当前用户信息
export const getCurrentUserController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const user = await getCurrentUser(res.locals.userId as number);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};
