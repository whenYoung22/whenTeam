import type { TaskResponse, UserSummary } from "../../../shared/index.js";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.util.js";
import type { CreateTaskInput } from "../validations/task.validation.js";

const taskInclude = {
  assignee: {
    select: { id: true, name: true, avatarUrl: true },
  },
} as const;

type TaskWithAssignee = Prisma.TaskGetPayload<{
  include: typeof taskInclude;
}>;

function toTaskResponse(task: TaskWithAssignee): TaskResponse {
  const assignee: UserSummary = {
    id: task.assignee.id,
    name: task.assignee.name,
    ...(task.assignee.avatarUrl !== null
      ? { avatarUrl: task.assignee.avatarUrl }
      : {}),
  };

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    projectId: task.projectId,
    dueDate: task.dueDate.toISOString().slice(0, 10),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    assignee,
  };
}

/** Return a project's tasks to one of its members. */
export async function getProjectTasks(
  userId: number,
  projectId: number,
): Promise<TaskResponse[]> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: { userId },
      },
    },
    select: { id: true },
  });

  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "项目不存在");
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: taskInclude,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return tasks.map(toTaskResponse);
}

/** Create a task for a project member and assign it to one of that project's members. */
export async function createProjectTask(
  userId: number,
  projectId: number,
  input: CreateTaskInput,
): Promise<TaskResponse> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: { userId },
      },
    },
    select: {
      dueDate: true,
      members: {
        select: { userId: true },
      },
    },
  });

  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "项目不存在");
  }

  if (!project.members.some(({ userId: memberId }) => memberId === input.assigneeId)) {
    throw new AppError(
      400,
      "ASSIGNEE_NOT_PROJECT_MEMBER",
      "任务负责人必须是项目成员",
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  if (input.dueDate < today) {
    throw new AppError(
      400,
      "TASK_DUE_DATE_IN_PAST",
      "任务截止日期不能早于今天",
    );
  }

  const dueDate = new Date(`${input.dueDate}T00:00:00.000Z`);
  if (dueDate > project.dueDate) {
    throw new AppError(
      409,
      "TASK_DUE_DATE_CONFLICT",
      "任务截止日期不能晚于项目截止日期",
    );
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      dueDate,
      projectId,
      assigneeId: input.assigneeId,
    },
    include: taskInclude,
  });

  return toTaskResponse(task);
}
