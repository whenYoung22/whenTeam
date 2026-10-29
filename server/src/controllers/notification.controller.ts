import type { RequestHandler } from "express";
import { getNotifications, getUnreadNotificationCount, markAllNotificationsRead, markNotificationRead } from "../services/notification.service.js";
import { AppError } from "../utils/AppError.util.js";
import { sendSuccess } from "../utils/response.util.js";

// 解析并校验路径参数中的通知 ID
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

// 获取当前用户的通知列表（含未读数）
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

// 获取当前用户的未读通知数量
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

// 将指定通知标记为已读 ；先解析并校验路径中的 notificationId，再调用 service 层处理归属校验
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

// 将当前用户的所有未读通知标记为已读
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
