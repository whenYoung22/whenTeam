// 负责RefreshToken Cookie的读取、设置和清除，不负责验证 Token 或管理数据库会话；在auth.controller中调用

import type { Request, Response } from "express";
import { refreshTokenLifetimeMs } from "./auth.constants.js";

export const refreshTokenCookieName = "whenteam.refreshToken";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
  maxAge: refreshTokenLifetimeMs,
};

export function getRefreshTokenCookie(req: Request): string | null {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${refreshTokenCookieName}=`));

  return cookie?.slice(refreshTokenCookieName.length + 1) || null;
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(refreshTokenCookieName, token, refreshTokenCookieOptions);
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(refreshTokenCookieName, {
    httpOnly: refreshTokenCookieOptions.httpOnly,
    secure: refreshTokenCookieOptions.secure,
    sameSite: refreshTokenCookieOptions.sameSite,
    path: refreshTokenCookieOptions.path,
  });
}
