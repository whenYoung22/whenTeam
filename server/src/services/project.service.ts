import type { ProjectDetailResponse, ProjectListItem } from "../../../shared/index.js";

import { prisma } from "../lib/prisma.js";

import type { CreateProjectInput, UpdateProjectInput } from "../validations/project.validation.js";

import { NotificationType } from "../generated/prisma/client.js";

import { AppError } from "../utils/AppError.util.js";
import { getSoftRandomColor } from "../utils/getSoftRandomColor.util.js";

import { toProjectDetailResponse, toProjectListItem } from "../mappers/project.mapper.js";

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
      favorites: {
        where: { userId },
        select: { projectId: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map(toProjectListItem);
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

  const favorite = await prisma.projectFavorite.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
    select: { projectId: true },
  });

  return toProjectDetailResponse(project, favorite !== null);
}

/** 设置当前用户对项目的收藏状态；只有项目成员可以操作。 */
export async function setProjectFavorite(
  userId: number,
  projectId: number,
  isFavorite: boolean,
): Promise<void> {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
    select: { projectId: true },
  });

  if (!membership) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "项目不存在");
  }

  if (isFavorite) {
    await prisma.projectFavorite.upsert({
      where: {
        projectId_userId: { projectId, userId },
      },
      create: { projectId, userId },
      update: {},
    });
    return;
  }

  await prisma.projectFavorite.deleteMany({
    where: { projectId, userId },
  });
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

    let newMembers: { id: number; name: string }[] = [];
    let removedMemberIds: number[] = [];
    if (input.memberIds !== undefined) {
      const memberIds = [
        ...new Set([...input.memberIds, existingProject.creatorId]),
      ];
      const users = await tx.user.findMany({
        where: {
          id: { in: memberIds },
        },
        select: { id: true, name: true },
      });

      if (users.length !== memberIds.length) {
        throw new AppError(400, "MEMBER_NOT_FOUND", "部分项目成员不存在");
      }

      const existingMemberIds = new Set(
        existingProject.members.map(
          ({ userId: existingMemberId }) => existingMemberId,
        ),
      );
      newMembers = users.filter(({ id }) => !existingMemberIds.has(id));
      removedMemberIds = existingProject.members
        .map(({ userId: existingMemberId }) => existingMemberId)
        .filter((memberId) => !memberIds.includes(memberId));

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

    await createNotifications(
      tx,
      removedMemberIds.map((receiverId) => ({
        type: NotificationType.PROJECT_MEMBER_REMOVED,
        content: `你已被移出项目「${project.name}」`,
        creatorId: userId,
        receiverId,
        projectId,
      })),
    );

    if (newMembers.length > 0) {
      await createNotifications(
        tx,
        newMembers.map(({ id: receiverId }) => ({
          type: NotificationType.PROJECT_MEMBER_ADDED,
          content: `邀请你加入项目「${project.name}」`,
          creatorId: userId,
          receiverId,
          projectId,
        })),
      );

      const newMemberIds = newMembers.map(({ id }) => id);
      const newMemberNames = newMembers.map(({ name }) => name).join("、");
      const existingMemberRecipients = await tx.projectMember.findMany({
        where: { projectId, userId: { notIn: [userId, ...newMemberIds] } },
        select: { userId: true },
      });
      await createNotifications(
        tx,
        existingMemberRecipients.map(({ userId: receiverId }) => ({
          type: NotificationType.PROJECT_MEMBER_ADDED,
          content: `邀请${newMemberNames}加入了项目「${project.name}」`,
          creatorId: userId,
          receiverId,
          projectId,
        })),
      );
    }

    const favorite = await tx.projectFavorite.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
      select: { projectId: true },
    });

    return toProjectDetailResponse(project, favorite !== null);
  });
}
