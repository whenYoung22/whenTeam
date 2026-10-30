import { useCallback, useState } from "react";
import type {
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from "@shared/index";
import {
  createProjectTask,
  deleteTask as deleteTaskRequest,
  updateTask as updateTaskRequest,
} from "@/api/task";

export default function useTaskMutations() {
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

  // 创建任务
  const createTask = useCallback(
    (projectId: number, request: CreateTaskRequest): Promise<TaskResponse> =>
      runMutation(() => createProjectTask(projectId, request)),
    [runMutation],
  );

  // 更新任务
  const updateTask = useCallback(
    (taskId: number, request: UpdateTaskRequest): Promise<TaskResponse> =>
      runMutation(() => updateTaskRequest(taskId, request)),
    [runMutation],
  );

  const deleteTask = useCallback(
    (taskId: number): Promise<void> =>
      runMutation(() => deleteTaskRequest(taskId)),
    [runMutation],
  );

  return { createTask, updateTask, deleteTask, isPending: pendingCount > 0 };
}
