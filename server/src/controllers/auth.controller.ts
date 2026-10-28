import type { RequestHandler } from "express";

import { login } from "../services/login.service.js";
import { register } from "../services/register.service.js";

import { clearRefreshTokenCookie, getRefreshTokenCookie, setRefreshTokenCookie } from "../utils/refresh-cookie.util.js";

import { revokeAuthSession, rotateRefreshToken } from "../services/refresh-token-session.service.js";

import { sendSuccess } from "../utils/response.util.js";
import { AppError } from "../utils/AppError.util.js";

import { loginSchema, registerSchema } from "../validations/auth.validation.js";

// 处理注册
export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await register(input);
    const { refreshToken, ...response } = result;
    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, response, 201);
  } catch (error) {
    next(error);
  }
};

// 处理登录
export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await login(input);
    const { refreshToken, ...response } = result;
    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, response);
  } catch (error) {
    next(error);
  }
};

// 登出 清除RefreshToken
export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenCookie(req);
    if (refreshToken) {
      await revokeAuthSession(refreshToken);
    }
    clearRefreshTokenCookie(res);
    sendSuccess(res, { loggedOut: true });
  } catch (error) {
    next(error);
  }
};

// 刷新token 在RefreshToken期限内 可刷新AccessToken
export const refreshController: RequestHandler = async (req, res, next) => {
  const refreshToken = getRefreshTokenCookie(req);
  if (!refreshToken) {
    clearRefreshTokenCookie(res);
    next(new AppError(401, "INVALID_REFRESH_TOKEN", "登录已失效，请重新登录"));
    return;
  }

  try {
    const result = await rotateRefreshToken(refreshToken);
    setRefreshTokenCookie(res, result.refreshToken);
    sendSuccess(res, { token: result.accessToken });
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      clearRefreshTokenCookie(res);
    }
    next(error);
  }
};
