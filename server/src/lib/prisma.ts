// 作为整个后端统一的数据库访问入口 整个后端共用一个 Prisma Client 实例
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config/index.js";


// 读取数据库配置
const connectionUrl = new URL(config.databaseUrl);

// 创建 Adapter PrismaMariaDb 使用 MariaDB 驱动协议连接 MySQL
const adapter = new PrismaMariaDb({
  host: connectionUrl.hostname,
  port: Number(connectionUrl.port || 3306),
  user: decodeURIComponent(connectionUrl.username),
  password: decodeURIComponent(connectionUrl.password),
  database: connectionUrl.pathname.replace(/^\//, ""),
  connectionLimit: 5,
});


// 创建 Prisma Client
export const prisma = new PrismaClient({ adapter });
