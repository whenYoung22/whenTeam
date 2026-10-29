import type {
  ApiSuccessResponse,
  NotificationListResponse,
} from "@shared/index";
import apiClient from "@/service/apiClient";

export async function getNotifications(): Promise<NotificationListResponse> {
  const response =
    await apiClient.get<ApiSuccessResponse<NotificationListResponse>>(
      "/api/notifications",
    );
  return response.data.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiClient.get<ApiSuccessResponse<number>>(
    "/api/notifications/unread-count",
  );
  return response.data.data;
}

export async function markNotificationRead(
  notificationId: number,
): Promise<void> {
  await apiClient.patch(`/api/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post("/api/notifications/read-all");
}
