// 管理服务端的 Refresh Token 会话，例如创建、验证、轮换和撤销会话记录

import { createHash, randomBytes, randomUUID } from "node:crypto";

import { prisma } from "../lib/prisma.js";

import { AppError } from "../utils/AppError.util.js";

import { refreshTokenLifetimeMs } from "../utils/auth.constants.js";

import { createAccessToken } from "../utils/access-token.util.js";

function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

// 登录时建立会话 生成 Access Token（无状态 JWT）和 Refresh Token
export async function createAuthSession(userId: number): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + refreshTokenLifetimeMs);
  const accessToken = await createAccessToken(userId);
  const refreshToken = createRefreshToken();

  await prisma.$transaction([
    prisma.authSession.deleteMany({ where: { expiresAt: { lte: now } } }),
    prisma.authSession.create({
      data: {
        userId,
        familyId: randomUUID(),
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt,
      },
    }),
  ]);

  return { accessToken, refreshToken };
}

// 刷新时轮换 当前是绝对过期而非滑动续期  Access + Refresh一起发；新Refresh Token的过期时间继承旧会话的过期时间
export async function rotateRefreshToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const tokenHash = hashRefreshToken(refreshToken);
  const rotated = await prisma.$transaction(async (transaction) => {
    const current = await transaction.authSession.findUnique({
      where: { tokenHash },
    });

    if (!current) {
      return null;
    }

    const now = new Date();
    if (current.revokedAt || current.expiresAt <= now) {
      await transaction.authSession.updateMany({
        where: {
          familyId: current.familyId,
          revokedAt: null,
        },
        data: { revokedAt: now },
      });
      return null;
    }

    const accessToken = await createAccessToken(current.userId);
    const nextRefreshToken = createRefreshToken();
    const claimed = await transaction.authSession.updateMany({
      where: {
        id: current.id,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { revokedAt: now },
    });

    if (claimed.count !== 1) {
      await transaction.authSession.updateMany({
        where: {
          familyId: current.familyId,
          revokedAt: null,
        },
        data: { revokedAt: now },
      });
      return null;
    }

    await transaction.authSession.create({
      data: {
        userId: current.userId,
        familyId: current.familyId,
        tokenHash: hashRefreshToken(nextRefreshToken),
        expiresAt: current.expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
    };
  });

  if (!rotated) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "登录已失效，请重新登录");
  }

  return rotated;
}

// 登出时撤销
export async function revokeAuthSession(refreshToken: string): Promise<void> {
  const current = await prisma.authSession.findUnique({
    where: { tokenHash: hashRefreshToken(refreshToken) },
    select: { familyId: true },
  });

  if (!current) {
    return;
  }

  await prisma.authSession.updateMany({
    where: {
      familyId: current.familyId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}
