import type { RequestHandler } from "express";

export const devAuth: RequestHandler = (_req, res, next) => {
  const userId = Number(process.env.DEV_USER_ID);

  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(500).json({
      message: "DEV_USER_ID is not configured correctly",
    });
    return;
  }

  res.locals.userId = userId;
  next();
};