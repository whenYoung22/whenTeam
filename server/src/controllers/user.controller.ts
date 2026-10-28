import type { RequestHandler } from "express";

import { getCurrentUser, getUsers } from "../services/user.service.js";

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

// 获取所有用户
export const getUsersController: RequestHandler = async (_req, res, next) => {
  try {
    const users = await getUsers();
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};
