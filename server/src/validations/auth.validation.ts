import { z } from "zod";

export const loginSchema = z
  .object({
    name: z.string().trim().min(1, "请输入用户名").max(100),
    password: z
      .string()
      .min(1, "请输入密码")
      .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
        message: "密码长度不能超过 72 个字节",
      }),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
