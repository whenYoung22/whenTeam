import { compare } from "bcryptjs";

import type { LoginResponse, User } from "../../../shared/index.js";

import { prisma } from "../lib/prisma.js";

import type { LoginInput } from "../validations/auth.validation.js";

import { AppError } from "../utils/AppError.util.js";
import { createAccessToken } from "../utils/auth-token.util.js";

// 返回给用户的格式
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

// 验证用户名和密码 实现登录
export async function login(input: LoginInput): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({
    where: { name: input.name },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      passwordHash: true,
    },
  });

  if (!user || !(await compare(input.password, user.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "用户名或密码错误");
  }

  return {
    user: toUser(user),
    token: await createAccessToken(user.id),
  };
}