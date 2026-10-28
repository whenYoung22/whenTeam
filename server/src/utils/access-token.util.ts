// 签发和验证 Access Token（JWT），包括设置有效期、签名和检查声明

import { SignJWT, jwtVerify } from "jose";
import { AppError } from "./AppError.util.js";

const issuer = "whenteam";
const audience = "whenteam-client";

// 获读取保存在服务器环境变量 AUTH_JWT_SECRET 中的 JWT 签名密钥
export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("AUTH_JWT_SECRET must contain at least 32 bytes");
  }

  return new TextEncoder().encode(secret);
}

// 签发AccessToken
export async function createAccessToken(userId: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("15m")
    // .setExpirationTime("5s")
    .sign(getAuthSecret());
}

// 验证AccessToken
export async function verifyAccessToken(token: string): Promise<number> {
  const { payload } = await jwtVerify(token, getAuthSecret(), {
    algorithms: ["HS256"],
    issuer,
    audience,
  });
  if (!payload.sub || !/^[1-9]\d*$/.test(payload.sub)) {
    throw new AppError(401, "INVALID_TOKEN", "登录状态无效或已过期");
  }

  const userId = Number(payload.sub);
  if (!Number.isSafeInteger(userId)) {
    throw new AppError(401, "INVALID_TOKEN", "登录状态无效或已过期");
  }
  return userId;
}
