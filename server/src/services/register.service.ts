import { hash } from "bcryptjs";

import type { RegisterResponse, User } from "../../../shared/index.js";

// prisma（小写）是数据库客户端实例 操作数据库
import { prisma } from "../lib/prisma.js";

// Prisma（大写）是 Prisma 生成的命名空间 此处用于判断 Prisma 错误类型
import { Prisma } from "../generated/prisma/client.js";

import type { RegisterInput } from "../validations/auth.validation.js";

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


// 用户注册
export async function register(
  input: RegisterInput,
): Promise<RegisterResponse & { refreshToken: string }> {
  const passwordHash = await hash(input.password, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: input.name,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "USERNAME_TAKEN", "用户名已被使用");
    }
    throw error;
  }

  const session = await createAuthSession(user.id);
  return {
    user: toUser(user),
    token: session.accessToken,
    refreshToken: session.refreshToken,
  };
}