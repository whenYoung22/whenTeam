// 加载环境变量
import "dotenv/config";

// 默认客户端来源
const defaultClientOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

// 解析运行环境
function parseNodeEnv(value: string | undefined): "development" | "test" | "production" {
  const nodeEnv = value ?? "development";
  if (
    nodeEnv !== "development" &&
    nodeEnv !== "test" &&
    nodeEnv !== "production"
  ) {
    throw new Error("NODE_ENV must be development, test, or production");
  }
  return nodeEnv;
}

// 解析端口
function parsePort(value: string | undefined): number {
  const portValue = value ?? "3000";
  if (!/^\d+$/.test(portValue)) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
}

// 解析 CORS 白名单
function parseClientOrigins(value: string | undefined): string[] {
  const origins = (value ?? defaultClientOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("CLIENT_ORIGINS must contain at least one allowed origin");
  }

  return [...new Set(origins.map((origin) => {
    let parsedOrigin: URL;
    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new Error(`CLIENT_ORIGINS contains an invalid origin: ${origin}`);
    }

    if (
      !["http:", "https:"].includes(parsedOrigin.protocol) ||
      parsedOrigin.username ||
      parsedOrigin.password ||
      parsedOrigin.pathname !== "/" ||
      parsedOrigin.search ||
      parsedOrigin.hash
    ) {
      throw new Error(`CLIENT_ORIGINS must contain only HTTP(S) origins: ${origin}`);
    }

    return parsedOrigin.origin;
  }))];
}

// 校验数据库连接串
function requireDatabaseUrl(value: string | undefined): string {
  if (!value) {
    throw new Error("DATABASE_URL is not configured");
  }

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid MySQL connection URL");
  }

  if (
    databaseUrl.protocol !== "mysql:" ||
    !databaseUrl.hostname ||
    databaseUrl.pathname.length < 2
  ) {
    throw new Error("DATABASE_URL must be a valid MySQL connection URL");
  }

  return value;
}

// 校验 JWT 密钥
function requireAuthJwtSecret(value: string | undefined): string {
  if (!value || Buffer.byteLength(value, "utf8") < 32) {
    throw new Error("AUTH_JWT_SECRET must contain at least 32 bytes");
  }
  return value;
}

// 导出配置对象
export const config = {
  nodeEnv: parseNodeEnv(process.env.NODE_ENV),
  port: parsePort(process.env.PORT),
  clientOrigins: parseClientOrigins(process.env.CLIENT_ORIGINS),
  databaseUrl: requireDatabaseUrl(process.env.DATABASE_URL),
  authJwtSecret: requireAuthJwtSecret(process.env.AUTH_JWT_SECRET),
  seedUserPassword: process.env.SEED_USER_PASSWORD,
};
