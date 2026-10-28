import { compare } from "bcryptjs";

import type { LoginResponse, User } from "../../../shared/index.js";

import { prisma } from "../lib/prisma.js";

import type { LoginInput } from "../validations/auth.validation.js";

import { AppError } from "../utils/AppError.util.js";
import { createAuthSession } from "./refresh-token-session.service.js";

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
export async function login(
  input: LoginInput,
): Promise<LoginResponse & { refreshToken: string }> {
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
  
// 登录时建立会话 生成 Access Token（无状态 JWT）和 Refresh Token
  const session = await createAuthSession(user.id);
  return {
    user: toUser(user),
    token: session.accessToken,
    refreshToken: session.refreshToken,
  };
}