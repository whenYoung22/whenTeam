import { Router } from "express";
import { getNotificationsController, getUnreadNotificationCountController, markAllNotificationsReadController, markNotificationReadController } from "../controllers/notification.controller.js";

const router = Router();

// GET /api/notifications 获取通知
router.get("/", getNotificationsController);

// GET /api/notifications/unread-count 未读通知数
router.get("/unread-count", getUnreadNotificationCountController);

// PATCH /api/notifications/:notificationId/read 已读指定通知
router.patch("/:notificationId/read", markNotificationReadController);

// POST /api/notifications/read-all 已读所有通知
router.post("/read-all", markAllNotificationsReadController);

export default router;
