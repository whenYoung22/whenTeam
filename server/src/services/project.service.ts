import type { ProjectDetailResponse, ProjectListItem, ProjectOverviewResponse, UserSummary } from "../../../shared/index.js";

import { prisma } from "../lib/prisma.js";

import type { CreateProjectInput, UpdateProjectInput } from "../validations/project.validation.js";

import type { Prisma } from "../generated/prisma/client.js";
import { NotificationType } from "../generated/prisma/client.js";

import { AppError } from "../utils/AppError.util.js";
import { getSoftRandomColor } from "../utils/getSoftRandomColor.util.js";
import { createNotifications } from "./notification.service.js";


// 详情查询只取组装接口响应需要的任务状态和成员摘要，避免读取无关字段。
const projectDetailInclude = {
  tasks: {
    select: { status: true },
  },
  members: {
    select: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  },
} as const;

type ProjectWithDetails = Prisma.ProjectGetPayload<{
  include: typeof projectDetailInclude;
}>;

// 数据库中的 avatarUrl 可为 null，共享接口类型中则是可选字段，因此需要转换。
function toUserSummary(user: {
  id: number;
  name: string;
  avatarUrl: string | null;
}): UserSummary {
  return {
    id: user.id,
    name: user.name,
    ...(user.avatarUrl !== null ? { avatarUrl: user.avatarUrl } : {}),
  };
}

// 项目进度按已完成任务占全部任务的比例计算；没有任务时进度为 0。
function getTaskMetrics(tasks: { status: string }[]) {
  const taskCount = tasks.length;
  const completedCount = tasks.filter((task) => task.status === "DONE").length;

  return {
    taskCount,
    progress:
      taskCount === 0 ? 0 : Math.round((completedCount / taskCount) * 100),
  };
}

// 将 Prisma 查询结果转换为 shared 契约，并把数据库日期序列化为接口格式。
function toProjectDetailResponse(
  project: ProjectWithDetails,
): ProjectDetailResponse {
  const { taskCount, progress } = getTaskMetrics(project.tasks);

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    color: project.color,
    createdAt: project.createdAt.toISOString(),
    dueDate: project.dueDate.toISOString().slice(0, 10),
    progress,
    taskCount,
    isFavorite: false,
    members: project.members.map(({ user }) => toUserSummary(user)),
  };
}

// 总览统计按 UTC 自然周计算，范围为周一开始、下周一结束（不包含结束时刻）。
function getUtcWeekRange() {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  return { start, end };
}

/** 查询当前用户参与的项目，返回列表需要的摘要和进度数据。 */
export async function getProjects(userId: number): Promise<ProjectListItem[]> {
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      tasks: {
        select: { status: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map((project) => {
    const { taskCount, progress } = getTaskMetrics(project.tasks);

    return {
      id: project.id,
      name: project.name,
      color: project.color,
      progress,
      taskCount,
      isFavorite: false,
    };
  });
}

/** 查询项目详情；只有项目成员可以读取，未找到或无权访问时返回项目不存在。 */
export async function getProject(
  userId: number,
  projectId: number,
): Promise<ProjectDetailResponse> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: { userId },
      },
    },
    include: projectDetailInclude,
  });

  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "项目不存在");
  }

  return toProjectDetailResponse(project);
}

/**
 * 创建项目并自动将创建者加入成员关系。
 * 返回完整详情，创建成功后可直接用于展示项目内容。
 */
export async function createProject(
  userId: number,
  input: CreateProjectInput,
): Promise<ProjectDetailResponse> {
  const memberIds = [...new Set([...input.memberIds, userId])];

  return prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({
      where: {
        id: { in: memberIds },
      },
      select: { id: true },
    });

    if (users.length !== memberIds.length) {
      throw new AppError(400, "MEMBER_NOT_FOUND", "部分项目成员不存在");
    }

    const project = await tx.project.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        color: getSoftRandomColor(),
        dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
        creatorId: userId,
        members: {
          create: memberIds.map((memberId) => ({
            userId: memberId,
          })),
        },
      },
      include: projectDetailInclude,
    });

    await createNotifications(
      tx,
      memberIds
        .filter((memberId) => memberId !== userId)
        .map((receiverId) => ({
          type: NotificationType.PROJECT_MEMBER_ADDED,
          content: `邀请你加入项目「${project.name}」`,
          creatorId: userId,
          receiverId,
          projectId: project.id,
        })),
    );

    return toProjectDetailResponse(project);
  });
}

/**
 * 仅允许创建者更新项目。传入 memberIds 时会替换其他成员，
 * 但始终保留创建者。
 */
export async function updateProject(
  userId: number,
  projectId: number,
  input: UpdateProjectInput,
): Promise<ProjectDetailResponse> {
  return prisma.$transaction(async (tx) => {
    const existingProject = await tx.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: { userId },
        },
      },
      select: {
        creatorId: true,
        members: { select: { userId: true } },
      },
    });

    if (!existingProject) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "项目不存在");
    }

    if (existingProject.creatorId !== userId) {
      throw new AppError(403, "PROJECT_FORBIDDEN", "只有项目创建者可以修改项目");
    }

    const updateData: {
      name?: string;
      description?: string;
      dueDate?: Date;
    } = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.dueDate !== undefined) {
      const dueDate = new Date(`${input.dueDate}T00:00:00.000Z`);
      const taskAfterDueDate = await tx.task.findFirst({
        where: {
          projectId,
          dueDate: { gt: dueDate },
        },
        select: { id: true },
      });

      if (taskAfterDueDate) {
        throw new AppError(
          409,
          "PROJECT_DUE_DATE_CONFLICT",
          "项目截止日期不能早于已有任务的截止日期",
        );
      }

      updateData.dueDate = dueDate;
    }

    let hasNewMembers = false;
    if (input.memberIds !== undefined) {
      const memberIds = [
        ...new Set([...input.memberIds, existingProject.creatorId]),
      ];
      const users = await tx.user.findMany({
        where: {
          id: { in: memberIds },
        },
        select: { id: true },
      });

      if (users.length !== memberIds.length) {
        throw new AppError(400, "MEMBER_NOT_FOUND", "部分项目成员不存在");
      }

      hasNewMembers = memberIds.some(
        (memberId) =>
          !existingProject.members.some(
            ({ userId: existingMemberId }) => existingMemberId === memberId,
          ),
      );

      await tx.projectMember.deleteMany({
        where: {
          projectId,
          userId: { notIn: memberIds },
        },
      });

      await tx.projectMember.createMany({
        data: memberIds.map((memberId) => ({
          projectId,
          userId: memberId,
        })),
        skipDuplicates: true,
      });
    }

    const project = await tx.project.update({
      where: { id: projectId },
      data: updateData,
      include: projectDetailInclude,
    });

    if (hasNewMembers) {
      const recipients = await tx.projectMember.findMany({
        where: { projectId, userId: { not: userId } },
        select: { userId: true },
      });
      await createNotifications(
        tx,
        recipients.map(({ userId: receiverId }) => ({
          type: NotificationType.PROJECT_MEMBER_ADDED,
          content: `邀请你加入项目「${project.name}」`,
          creatorId: userId,
          receiverId,
          projectId,
        })),
      );
    }

    return toProjectDetailResponse(project);
  });
}

/**
 * 汇总当前用户参与的项目数、去重协作者，以及本周到期的未完成任务数。
 * 任务数只统计分配给当前用户、且所在项目中包含当前用户的任务。
 */
export async function getProjectOverview(
  userId: number,
): Promise<ProjectOverviewResponse> {
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    select: {
      members: {
        select: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
  });

  const collaboratorsById = new Map<number, UserSummary>();
  for (const project of projects) {
    for (const { user } of project.members) {
      collaboratorsById.set(user.id, toUserSummary(user));
    }
  }

  const { start, end } = getUtcWeekRange();
  const weekTaskCount = await prisma.task.count({
    where: {
      assigneeId: userId,
      status: { not: "DONE" },
      dueDate: {
        gte: start,
        lt: end,
      },
      project: {
        members: {
          some: { userId },
        },
      },
    },
  });

  const collaborators = [...collaboratorsById.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return {
    projectCount: projects.length,
    weekTaskCount,
    collaborators,
    collaboratorCount: collaborators.length,
  };
}
