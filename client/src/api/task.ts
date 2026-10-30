import type {
  ApiSuccessResponse,
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from "@shared/index";
import apiClient from "@/service/apiClient";
import { notifyNotificationsChanged } from "@/utils/notificationEvents";


// 获取项目里的任务列表
export async function getProjectTaskList(
  projectId: number,
): Promise<TaskResponse[]> {
  const response = await apiClient.get<ApiSuccessResponse<TaskResponse[]>>(
    `/api/projects/${projectId}/tasks`,
  );
  return response.data.data;
}


// 创建项目里的任务
export async function createProjectTask(
  projectId: number,
  request: CreateTaskRequest,
): Promise<TaskResponse> {
  const response = await apiClient.post<ApiSuccessResponse<TaskResponse>>(
    `/api/projects/${projectId}/tasks`,
    request,
  );
  return response.data.data;
}


// 更新项目里的任务
export async function updateTask(
  taskId: number,
  request: UpdateTaskRequest,
): Promise<TaskResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<TaskResponse>>(
    `/api/tasks/${taskId}`,
    request,
  );
  return response.data.data;
}

// 删除项目里的任务
export async function deleteTask(taskId: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<null>>(`/api/tasks/${taskId}`);
  notifyNotificationsChanged();
}
