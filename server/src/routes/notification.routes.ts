import { Router } from "express";
import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", getNotificationsController);
router.get("/unread-count", getUnreadNotificationCountController);
router.patch("/:notificationId/read", markNotificationReadController);
router.post("/read-all", markAllNotificationsReadController);

export default router;
