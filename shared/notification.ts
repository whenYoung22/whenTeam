import type { IsoDateTime } from "./date";

export interface Notification {
  id: number;
  creatorId: number;
  creatorName: string;
  receiverId: number;
  content: string;
  projectId: number;
  isRead: boolean;
  createdAt: IsoDateTime;
}