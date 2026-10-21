
import { prisma } from "../lib/prisma.js";

async function main() {
  const user = await prisma.user.upsert({
    where: {
      name: "dev-user",
    },
    update: {},
    create: {
      name: "dev-user",
      passwordHash: "development-only",
    },
  });

  console.log("开发用户已准备好：", {
    id: user.id,
    name: user.name,
  });
}

main()
  .catch((error) => {
    console.error("创建开发用户失败：", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
