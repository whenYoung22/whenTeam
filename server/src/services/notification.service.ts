import type { NotificationListResponse } from "../../../shared/index.js";

import type { NotificationType, Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

import { AppError } from "../utils/AppError.util.js";
import { toNotificationResponse } from "../mappers/notification.mapper.js";

type NewNotification = {
  type: NotificationType;
  content: string;
  creatorId: number;
  receiverId: number;
  projectId: number | null;
  taskId?: number | null;
};

// 批量创建通知。
// 必须在事务中调用，保证与其他业务操作原子性； Prisma 事务客户端 notifications 待创建的通知列表
export async function createNotifications(
  tx: Prisma.TransactionClient,
  notifications: NewNotification[],
): Promise<number[]> {
  // 空列表直接返回，避免无意义的数据库调用
  if (notifications.length === 0) return [];

  await tx.notification.createMany({
    data: notifications.map((notification) => ({
      ...notification,
       // 统一将未指定的 taskId 置为 null
      taskId: notification.taskId ?? null,
    })),
  });

  return [...new Set(notifications.map(({ receiverId }) => receiverId))];
}

// 获取指定用户的通知列表（最近 20 条）及未读数
export async function getNotifications(
  userId: number,
): Promise<NotificationListResponse> {
  // 并行查询通知列表和未读数量，减少数据库往返
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { receiverId: userId },
      include: { creator: { select: { name: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 20,
    }),
    prisma.notification.count({
      where: { receiverId: userId, isRead: false },
    }),
  ]);
// 通知按创建时间倒序排列，时间相同则按 id 倒序，保证顺序稳定
  return {
    items: notifications.map(toNotificationResponse),
    unreadCount,
  };
}

// 获取指定用户的未读通知数量
export async function getUnreadNotificationCount(
  userId: number,
): Promise<number> {
  return prisma.notification.count({
    where: { receiverId: userId, isRead: false },
  });
}

// 将单条通知标记为已读； 会校验通知归属，防止用户操作他人通知；已读状态下不做重复更新
export async function markNotificationRead(
  userId: number,
  notificationId: number,
): Promise<void> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, receiverId: userId },
    select: { isRead: true },
  });

  if (!notification) {
    throw new AppError(404, "NOTIFICATION_NOT_FOUND", "通知不存在");
  }

  if (!notification.isRead) {
    await prisma.notification.updateMany({
      where: { id: notificationId, receiverId: userId },
      data: { isRead: true },
    });
  }
}

// 将指定用户的所有未读通知标记为已读
export async function markAllNotificationsRead(userId: number): Promise<void> {
  await prisma.notification.updateMany({
    where: { receiverId: userId, isRead: false },
    data: { isRead: true },
  });
}
