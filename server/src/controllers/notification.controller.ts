import type { RequestHandler } from "express";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service.js";
import { AppError } from "../utils/AppError.util.js";
import { sendSuccess } from "../utils/response.util.js";

function parseNotificationId(value: string | string[] | undefined): number {
  if (typeof value !== "string") {
    throw new AppError(400, "INVALID_NOTIFICATION_ID", "通知 ID 无效");
  }

  const notificationId = Number(value);
  if (!Number.isSafeInteger(notificationId) || notificationId <= 0) {
    throw new AppError(400, "INVALID_NOTIFICATION_ID", "通知 ID 无效");
  }

  return notificationId;
}

export const getNotificationsController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    sendSuccess(res, await getNotifications(res.locals.userId as number));
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotificationCountController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    sendSuccess(
      res,
      await getUnreadNotificationCount(res.locals.userId as number),
    );
  } catch (error) {
    next(error);
  }
};

export const markNotificationReadController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    await markNotificationRead(
      res.locals.userId as number,
      parseNotificationId(req.params.notificationId),
    );
    sendSuccess(res, { isRead: true });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsReadController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    await markAllNotificationsRead(res.locals.userId as number);
    sendSuccess(res, { isRead: true });
  } catch (error) {
    next(error);
  }
};
