// 周日期、协作者统计逻辑
import type { ProjectOverviewResponse, UserSummary } from "../../../shared/index.js";

import { prisma } from "../lib/prisma.js";
import { toUserSummary } from "../mappers/user.mapper.js";

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
