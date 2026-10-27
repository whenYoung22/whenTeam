import type { User } from "../../../shared/index.js";

import { prisma } from "../lib/prisma.js";

import { AppError } from "../utils/AppError.util.js";

function toUser(user: {
  id: number;
  name: string;
  avatarUrl: string | null;
}): User {
  return {
    id: user.id,
    name: user.name,
    ...(user.avatarUrl !== null ? { avatarUrl: user.avatarUrl } : {}),
  };
}


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
