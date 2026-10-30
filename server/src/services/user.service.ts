import type { User, UserSummary } from "../../../shared/index.js";

import { prisma } from "../lib/prisma.js";

import { AppError } from "../utils/AppError.util.js";
import { toUser, toUserSummary } from "../mappers/user.mapper.js";

// 获取当前登录用户
export async function getCurrentUser(userId: number): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, avatarUrl: true },
  });

  if (!user) {
    throw new AppError(401, "INVALID_TOKEN", "登录状态已失效，请重新登录");
  }

  return toUser(user);
}

// 获取所有用户
export async function getUsers(): Promise<UserSummary[]> {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, avatarUrl: true },
    orderBy: { name: "asc" },
  });

  return users.map(toUserSummary);
}
