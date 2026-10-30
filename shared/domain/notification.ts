import type { IsoDateTime } from "../common/date";

export interface Notification {
  id: number;
  type:
    | "TASK_ASSIGNED"
    | "TASK_STATUS_CHANGED"
    | "PROJECT_MEMBER_ADDED"
    | "PROJECT_MEMBER_REMOVED";
  creatorId: number;
  creatorName: string;
  receiverId: number;
  content: string;
  projectId: number;
  taskId: number | null;
  isRead: boolean;
  createdAt: IsoDateTime;
}

export interface NotificationListResponse {
  items: Notification[];
  unreadCount: number;
}