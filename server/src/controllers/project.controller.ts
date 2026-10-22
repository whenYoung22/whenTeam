import type { RequestHandler } from "express";

import { createProjectSchema } from "../validations/project.validation.js";

import { createProject, getProjects } from "../services/project.service.js";

import { sendSuccess, sendError } from "../utils/response.util.js";


export const getProjectsController: RequestHandler = async (_req, res, next) => {
    try {
        const userId = res.locals.userId as number;
        const projects = await getProjects(userId);

        sendSuccess(res, projects);
    } catch (error) {
        next(error);
    }
};



export const createProjectController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const result = createProjectSchema.safeParse(req.body);

        if (!result.success) {
            sendError(res, "VALIDATION_ERROR", "请求参数校验失败", 400);
            return;
        }

        const userId = res.locals.userId as number;
        const project = await createProject(userId, result.data);

        sendSuccess(res, project, 201);
    } catch (error) {
        if (error instanceof Error && error.message === "MEMBER_NOT_FOUND") {
            sendError(res, "MEMBER_NOT_FOUND", "部分项目成员不存在", 400);
            return;
        }

        next(error);
    }
};
