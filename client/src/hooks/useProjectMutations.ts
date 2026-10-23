import { useCallback, useState } from "react";
import type {
  CreateProjectRequest,
  CreateTaskRequest,
  ProjectDetailResponse,
  TaskResponse,
  UpdateProjectRequest,
} from "@shared/index";
import {
  createProject as createProjectRequest,
  createProjectTask as createProjectTaskRequest,
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

  const createProject = useCallback(
    (request: CreateProjectRequest): Promise<ProjectDetailResponse> =>
      runMutation(() => createProjectRequest(request)),
    [runMutation],
  );

  const createProjectTask = useCallback(
    (
      projectId: number,
      request: CreateTaskRequest,
    ): Promise<TaskResponse> =>
      runMutation(() => createProjectTaskRequest(projectId, request)),
    [runMutation],
  );

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
    createProjectTask,
    updateProject,
    isPending: pendingCount > 0,
  };
}
