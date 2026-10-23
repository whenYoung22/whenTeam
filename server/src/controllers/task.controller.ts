import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.util.js";
import { sendSuccess } from "../utils/response.util.js";
import {
  createProjectTask,
  getProjectTasks,
} from "../services/task.service.js";
import { createTaskSchema } from "../validations/task.validation.js";

function parseProjectId(value: string | string[] | undefined): number {
  if (typeof value !== "string") {
    throw new AppError(400, "INVALID_PROJECT_ID", "项目 ID 无效");
  }

  const projectId = Number(value);
  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    throw new AppError(400, "INVALID_PROJECT_ID", "项目 ID 无效");
  }

  return projectId;
}

/** GET /api/projects/:projectId/tasks：查询项目任务列表。 */
export const getProjectTasksController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const tasks = await getProjectTasks(
      res.locals.userId as number,
      parseProjectId(req.params.projectId),
    );
    sendSuccess(res, tasks);
  } catch (error) {
    next(error);
  }
};

/** POST /api/projects/:projectId/tasks：为项目创建任务。 */
export const createProjectTaskController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const input = createTaskSchema.parse(req.body);
    const task = await createProjectTask(
      res.locals.userId as number,
      parseProjectId(req.params.projectId),
      input,
    );
    sendSuccess(res, task, 201);
  } catch (error) {
    next(error);
  }
};
