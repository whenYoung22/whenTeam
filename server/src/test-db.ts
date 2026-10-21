import { prisma } from "./lib/prisma.js";

try {
    await prisma.$connect();

    const users = await prisma.user.findMany();

    console.log("数据库连接成功");
    console.log("当前用户数量：", users.length);
    console.log("当前用户名：", users.map((user) => user.name));
} catch (error) {
    console.error("数据库连接或查询失败：", error);
    process.exitCode = 1;
} finally {
    await prisma.$disconnect();
}