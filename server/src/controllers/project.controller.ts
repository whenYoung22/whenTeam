import type { RequestHandler } from "express";
import { createProjectSchema } from "../validations/project.validation.js";
import { createProject, getProjects } from "../services/project.service.js";

export const getProjectsController: RequestHandler = async (
    _req,
    res,
    next,
) => {
    try {
        const userId = res.locals.userId as number;
        const projects = await getProjects(userId);

        res.json({
            success: true,
            data: projects,
        });
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
            res.status(400).json({
                success: false,
                message: "请求参数校验失败",
                errors: result.error.flatten(),
            });
            return;
        }

        const userId = res.locals.userId as number;
        const project = await createProject(userId, result.data);

        res.status(201).json({
            success: true,
            data: project,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "MEMBER_NOT_FOUND") {
            res.status(400).json({
                success: false,
                message: "部分项目成员不存在",
            });
            return;
        }

        next(error);
    }
};
