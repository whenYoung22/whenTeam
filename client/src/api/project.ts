import type {
  ApiSuccessResponse,
  CreateProjectRequest,
  CreateTaskRequest,
  ProjectDetailResponse,
  ProjectListItem,
  ProjectOverviewResponse,
  TaskResponse,
  UpdateProjectRequest,
} from "@shared/index";
import apiClient from "@/service/apiClient";

export async function getProjects(): Promise<ProjectListItem[]> {
  const response =
    await apiClient.get<ApiSuccessResponse<ProjectListItem[]>>("/api/projects");
  return response.data.data;
}

export async function getProjectOverview(): Promise<ProjectOverviewResponse> {
  const response = await apiClient.get<
    ApiSuccessResponse<ProjectOverviewResponse>
  >("/api/projects/overview");
  return response.data.data;
}

export async function getProjectDetail(
  projectId: number,
): Promise<ProjectDetailResponse> {
  const response = await apiClient.get<ApiSuccessResponse<ProjectDetailResponse>>(
    `/api/projects/${projectId}`,
  );
  return response.data.data;
}

export async function createProject(
  request: CreateProjectRequest,
): Promise<ProjectDetailResponse> {
  const response = await apiClient.post<
    ApiSuccessResponse<ProjectDetailResponse>
  >("/api/projects", request);
  return response.data.data;
}

export async function updateProject(
  projectId: number,
  request: UpdateProjectRequest,
): Promise<ProjectDetailResponse> {
  const response = await apiClient.patch<
    ApiSuccessResponse<ProjectDetailResponse>
  >(`/api/projects/${projectId}`, request);
  return response.data.data;
}

export async function getProjectTaskList(
  projectId: number,
): Promise<TaskResponse[]> {
  const response = await apiClient.get<ApiSuccessResponse<TaskResponse[]>>(
    `/api/projects/${projectId}/tasks`,
  );
  return response.data.data;
}

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
