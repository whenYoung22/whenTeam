import { useCallback, useState } from "react";
import type {
  CreateProjectRequest,
  ProjectDetailResponse,
  UpdateProjectRequest,
} from "@shared/index";
import {
  createProject as createProjectRequest,
  updateProject as updateProjectRequest,
} from "@/api/project";

export default function useProjectMutations() {
  const [pendingCount, setPendingCount] = useState(0);

  const runMutation = useCallback(
    async <T>(request: () => Promise<T>): Promise<T> => {
      setPendingCount((count) => count + 1);
      try {
        return await request();
      } finally {
        setPendingCount((count) => count - 1);
      }
    },
    [],
  );

  // 创建项目 modal用
  const createProject = useCallback(
    (request: CreateProjectRequest): Promise<ProjectDetailResponse> =>
      runMutation(() => createProjectRequest(request)),
    [runMutation],
  );

  // 更新编辑项目
  const updateProject = useCallback(
    (
      projectId: number,
      request: UpdateProjectRequest,
    ): Promise<ProjectDetailResponse> =>
      runMutation(() => updateProjectRequest(projectId, request)),
    [runMutation],
  );

  return {
    createProject,
    updateProject,
    isPending: pendingCount > 0,
  };
}
