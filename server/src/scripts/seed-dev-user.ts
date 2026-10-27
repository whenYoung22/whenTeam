
import { prisma } from "../lib/prisma.js";
import { hash } from "bcryptjs";

async function main() {
  const password = process.env.SEED_USER_PASSWORD;
  if (!password || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("SEED_USER_PASSWORD must be set and no more than 72 bytes");
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.upsert({
    where: {
      name: "dev-user",
    },
    update: { passwordHash },
    create: {
      name: "dev-user",
      passwordHash,
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
