import { prisma } from "../lib/prisma.js";

import type { CreateProjectInput } from "../validations/project.validation.js";

import { getSoftRandomColor } from "../utils/getSoftRandomColor.util.js";



// 只查询当前用户参与的项目，并计算 progress、taskCount 和 isFavorite
export async function getProjects(userId: number) {
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

    return projects.map((project) => {
        const taskCount = project.tasks.length;
        const completedCount = project.tasks.filter(
            (task) => task.status === "DONE",
        ).length;

        return {
            id: project.id,
            name: project.name,
            color: project.color,
            progress:
                taskCount === 0
                    ? 0
                    : Math.round((completedCount / taskCount) * 100),
            taskCount,
            isFavorite: project.favorites.length > 0,
        };
    });
}


// 使用事务，保证项目和成员关系一起写入
export async function createProject(
    userId: number,
    input: CreateProjectInput,
) {
    // 去重，并确保创建者自动成为项目成员
    const memberIds = [...new Set([...input.memberIds, userId])];

    return prisma.$transaction(async (tx) => {
        const users = await tx.user.findMany({
            where: {
                id: { in: memberIds },
            },
            select: { id: true },
        });

        if (users.length !== memberIds.length) {
            throw new Error("MEMBER_NOT_FOUND");
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
        });

        return {
            id: project.id,
            name: project.name,
            description: project.description ?? "",
            color: project.color,
            createdAt: project.createdAt.toISOString(),
            dueDate: project.dueDate.toISOString().slice(0, 10),
        };
    });
}
