import type { RequestHandler } from "express";

import { getProjectOverview } from "../services/project-overview.service.js";
import { createProject, getProject, getProjects, setProjectFavorite, updateProject } from "../services/project.service.js";

import { createProjectSchema, updateProjectSchema } from "../validations/project.validation.js";

import { AppError } from "../utils/AppError.util.js";
import { sendSuccess } from "../utils/response.util.js";


// 路由参数以字符串形式传入；先校验 ID，再交给 service 查询。
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

/** GET /api/projects：返回当前用户参与的项目列表及进度摘要。 */
export const getProjectsController: RequestHandler = async (_req, res, next) => {
  try {
    const projects = await getProjects(res.locals.userId as number);
    sendSuccess(res, projects);
  } catch (error) {
    next(error);
  }
};

/** GET /api/projects/overview：返回当前用户的项目、协作者和本周任务统计。 */
export const getProjectOverviewController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const overview = await getProjectOverview(res.locals.userId as number);
    sendSuccess(res, overview);
  } catch (error) {
    next(error);
  }
};

/** GET /api/projects/:projectId：返回当前用户有权访问的项目详情。 */
export const getProjectController: RequestHandler = async (req, res, next) => {
  try {
    const project = await getProject(
      res.locals.userId as number,
      parseProjectId(req.params.projectId),
    );
    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
};

/** POST /api/projects：校验并创建项目，成功时返回完整详情和 HTTP 201。 */
export const createProjectController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const input = createProjectSchema.parse(req.body);
    const project = await createProject(res.locals.userId as number, input);
    sendSuccess(res, project, 201);
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/projects/:projectId：校验并更新项目，成功时返回更新后的详情。 */
export const updateProjectController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const input = updateProjectSchema.parse(req.body);
    const project = await updateProject(
      res.locals.userId as number,
      parseProjectId(req.params.projectId),
      input,
    );
    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
};

/** PUT /api/projects/:projectId/favorite：收藏当前项目。 */
export const favoriteProjectController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    await setProjectFavorite(
      res.locals.userId as number,
      parseProjectId(req.params.projectId),
      true,
    );
    sendSuccess(res, { isFavorite: true });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/projects/:projectId/favorite：取消收藏当前项目。 */
export const unfavoriteProjectController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    await setProjectFavorite(
      res.locals.userId as number,
      parseProjectId(req.params.projectId),
      false,
    );
    sendSuccess(res, { isFavorite: false });
  } catch (error) {
    next(error);
  }
};
