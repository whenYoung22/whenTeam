import { z } from "zod";

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "请输入有效日期");

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, "任务标题不能为空").max(200),
    description: z.string().trim().max(5000).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    assigneeId: z.number().int().positive(),
    dueDate: dateOnlySchema,
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
