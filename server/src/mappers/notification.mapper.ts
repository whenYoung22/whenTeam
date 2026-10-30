import type { Notification as NotificationResponse } from "../../../shared/index.js";

import type { NotificationType } from "../generated/prisma/client.js";

export function toNotificationResponse(notification: {
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
