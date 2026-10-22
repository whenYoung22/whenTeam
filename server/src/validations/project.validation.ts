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

// 创建项目
export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1, "项目名称不能为空").max(100),
    description: z.string().trim().max(5000).optional(),
    dueDate: dateOnlySchema,
    memberIds: z.array(z.number().int().positive()).max(100),
  })
  .strict();

// 更新项目
export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(5000).optional(),
    dueDate: dateOnlySchema.optional(),
    memberIds: z.array(z.number().int().positive()).max(100).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "至少提供一个需要更新的字段",
  });

  
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
