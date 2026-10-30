import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.util.js";
import { sendSuccess } from "../utils/response.util.js";
import {
  createProjectTask,
  deleteTask,
  getProjectTasks,
  updateTask,
} from "../services/task.service.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validations/task.validation.js";

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

function parseTaskId(value: string | string[] | undefined): number {
  if (typeof value !== "string") {
    throw new AppError(400, "INVALID_TASK_ID", "任务 ID 无效");
  }

  const taskId = Number(value);
  if (!Number.isSafeInteger(taskId) || taskId <= 0) {
    throw new AppError(400, "INVALID_TASK_ID", "任务 ID 无效");
  }

  return taskId;
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

/** PATCH /api/tasks/:taskId：更新任务。 */
export const updateTaskController: RequestHandler = async (req, res, next) => {
  try {
    const input = updateTaskSchema.parse(req.body);
    const task = await updateTask(
      res.locals.userId as number,
      parseTaskId(req.params.taskId),
      input,
    );
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/tasks/:taskId：删除任务。 */
export const deleteTaskController: RequestHandler = async (req, res, next) => {
  try {
    await deleteTask(
      res.locals.userId as number,
      parseTaskId(req.params.taskId),
    );
    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};
