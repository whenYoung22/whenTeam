import type {
  Notification as NotificationResponse,
  NotificationListResponse,
} from "../../../shared/index.js";
import type { NotificationType, Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.util.js";

type NewNotification = {
  type: NotificationType;
  content: string;
  creatorId: number;
  receiverId: number;
  projectId: number;
  taskId?: number | null;
};

export async function createNotifications(
  tx: Prisma.TransactionClient,
  notifications: NewNotification[],
): Promise<void> {
  if (notifications.length === 0) return;

  await tx.notification.createMany({
    data: notifications.map((notification) => ({
      ...notification,
      taskId: notification.taskId ?? null,
    })),
  });
}

function toNotificationResponse(notification: {
  id: number;
  type: NotificationType;
  content: string;
  creatorId: number;
  receiverId: number;
  projectId: number;
  taskId: number | null;
  isRead: boolean;
  createdAt: Date;
  creator: { name: string };
}): NotificationResponse {
  return {
    id: notification.id,
    type: notification.type,
    creatorId: notification.creatorId,
    creatorName: notification.creator.name,
    receiverId: notification.receiverId,
    content: notification.content,
    projectId: notification.projectId,
    taskId: notification.taskId,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function getNotifications(
  userId: number,
): Promise<NotificationListResponse> {
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

  return {
    items: notifications.map(toNotificationResponse),
    unreadCount,
  };
}

export async function getUnreadNotificationCount(
  userId: number,
): Promise<number> {
  return prisma.notification.count({
    where: { receiverId: userId, isRead: false },
  });
}

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

export async function markAllNotificationsRead(userId: number): Promise<void> {
  await prisma.notification.updateMany({
    where: { receiverId: userId, isRead: false },
    data: { isRead: true },
  });
}
