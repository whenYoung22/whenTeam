import type { TaskResponse } from "../../../shared/index.js";
import type { Prisma } from "../generated/prisma/client.js";
import { NotificationType } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.util.js";
import { toTaskResponse } from "../mappers/task.mapper.js";
import { createNotifications } from "./notification.service.js";
import { publishNotificationChanges } from "../websocket/notification.gateway.js";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "../validations/task.validation.js";

const taskInclude = {
  assignee: {
    select: { id: true, name: true, avatarUrl: true },
  },
} as const;

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

  const result = await prisma.$transaction(async (tx) => {
    const createdTask = await tx.task.create({
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

    const notificationReceiverIds = await createNotifications(
      tx,
      input.assigneeId === userId
        ? []
        : [
            {
              type: NotificationType.TASK_ASSIGNED,
              content: `将任务「${createdTask.title}」分配给你`,
              creatorId: userId,
              receiverId: input.assigneeId,
              projectId,
              taskId: createdTask.id,
            },
          ],
    );

    return { task: createdTask, notificationReceiverIds };
  });

  publishNotificationChanges(result.notificationReceiverIds);
  return toTaskResponse(result.task);
}

/** Update a task that belongs to a project the user can access. */
export async function updateTask(
  userId: number,
  taskId: number,
  input: UpdateTaskInput,
): Promise<TaskResponse> {
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        members: {
          some: { userId },
        },
      },
    },
    select: {
      title: true,
      status: true,
      assigneeId: true,
      project: {
        select: {
          creatorId: true,
          dueDate: true,
          members: {
            select: { userId: true },
          },
        },
      },
    },
  });

  if (!existingTask) {
    throw new AppError(404, "TASK_NOT_FOUND", "任务不存在");
  }

  const assigneeIsProjectMember = existingTask.project.members.some(
    ({ userId: memberId }) => memberId === existingTask.assigneeId,
  );
  const isProjectCreatorReassigningOrphanedTask =
    existingTask.project.creatorId === userId && !assigneeIsProjectMember;

  if (
    existingTask.assigneeId !== userId &&
    !isProjectCreatorReassigningOrphanedTask
  ) {
    throw new AppError(403, "TASK_FORBIDDEN", "只有任务负责人可以修改任务");
  }

  if (
    input.assigneeId !== undefined &&
    !existingTask.project.members.some(
      ({ userId: memberId }) => memberId === input.assigneeId,
    )
  ) {
    throw new AppError(
      400,
      "ASSIGNEE_NOT_PROJECT_MEMBER",
      "任务负责人必须是项目成员",
    );
  }

  const dueDate =
    input.dueDate === undefined
      ? undefined
      : new Date(`${input.dueDate}T00:00:00.000Z`);
  if (dueDate && dueDate > existingTask.project.dueDate) {
    throw new AppError(
      409,
      "TASK_DUE_DATE_CONFLICT",
      "任务截止日期不能晚于项目截止日期",
    );
  }

  const data: Prisma.TaskUncheckedUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.status !== undefined) data.status = input.status;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.assigneeId !== undefined) data.assigneeId = input.assigneeId;
  if (dueDate !== undefined) data.dueDate = dueDate;

  const result = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data,
      include: taskInclude,
    });

    const notifications = [];
    if (
      input.assigneeId !== undefined &&
      input.assigneeId !== existingTask.assigneeId &&
      input.assigneeId !== userId
    ) {
      notifications.push({
        type: NotificationType.TASK_ASSIGNED,
        content: `将任务「${updatedTask.title}」分配给你`,
        creatorId: userId,
        receiverId: input.assigneeId,
        projectId: updatedTask.projectId,
        taskId,
      });
    }

    if (input.status !== undefined && input.status !== existingTask.status) {
      const recipients = existingTask.project.members
        .map(({ userId: memberId }) => memberId)
        .filter((memberId) => memberId !== userId);
      notifications.push(
        ...recipients.map((receiverId) => ({
          type: NotificationType.TASK_STATUS_CHANGED,
          content: `将任务「${updatedTask.title}」状态更新为「${statusLabel(updatedTask.status)}」`,
          creatorId: userId,
          receiverId,
          projectId: updatedTask.projectId,
          taskId,
        })),
      );
    }

    const notificationReceiverIds = await createNotifications(tx, notifications);
    return { task: updatedTask, notificationReceiverIds };
  });

  publishNotificationChanges(result.notificationReceiverIds);
  return toTaskResponse(result.task);
}

/** Delete a task; only its assignee or the project creator may do so. */
export async function deleteTask(userId: number, taskId: number): Promise<void> {
  const notificationReceiverIds = await prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: {
        id: taskId,
        project: {
          members: {
            some: { userId },
          },
        },
      },
      select: {
        assigneeId: true,
        title: true,
        project: {
          select: {
            id: true,
            creatorId: true,
            members: { select: { userId: true } },
          },
        },
      },
    });
    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "任务不存在");
    }

    if (task.assigneeId !== userId && task.project.creatorId !== userId) {
      throw new AppError(
        403,
        "TASK_FORBIDDEN",
        "只有项目创建者或任务负责人可以删除任务",
      );
    }

    await tx.notification.deleteMany({ where: { taskId } });
    const notificationReceiverIds = await createNotifications(
      tx,
      task.project.members
        .map(({ userId: receiverId }) => receiverId)
        .filter((receiverId) => receiverId !== userId)
        .map((receiverId) => ({
          type: NotificationType.TASK_DELETED,
          content: `删除了任务「${task.title}」`,
          creatorId: userId,
          receiverId,
          projectId: task.project.id,
        })),
    );

    const result = await tx.task.deleteMany({
      where: {
        id: taskId,
        project: {
          members: {
            some: { userId },
          },
        },
        OR: [
          { assigneeId: userId },
          { project: { creatorId: userId } },
        ],
      },
    });
    if (result.count === 0) {
      throw new AppError(404, "TASK_NOT_FOUND", "任务不存在");
    }

    return notificationReceiverIds;
  });

  publishNotificationChanges(notificationReceiverIds);
}

function statusLabel(status: string): string {
  switch (status) {
    case "TODO":
      return "待开始";
    case "DOING":
      return "进行中";
    case "DONE":
      return "已完成";
    default:
      return status;
  }
}
