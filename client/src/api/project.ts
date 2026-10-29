import type {
  ApiSuccessResponse,
  CreateProjectRequest,
  ProjectDetailResponse,
  ProjectListItem,
  ProjectOverviewResponse,
  UpdateProjectRequest,
} from "@shared/index";
import apiClient from "@/service/apiClient";

// 查询项目列表 projectList
export async function getProjects(): Promise<ProjectListItem[]> {
  const response =
    await apiClient.get<ApiSuccessResponse<ProjectListItem[]>>("/api/projects");
  return response.data.data;
}

// 查项目总览 overviewPage overviewPanel
export async function getProjectOverview(): Promise<ProjectOverviewResponse> {
  const response = await apiClient.get<
    ApiSuccessResponse<ProjectOverviewResponse>
  >("/api/projects/overview");
  return response.data.data;
}

//查项目详情 detailPage detailPanel
export async function getProjectDetail(
  projectId: number,
): Promise<ProjectDetailResponse> {
  const response = await apiClient.get<ApiSuccessResponse<ProjectDetailResponse>>(
    `/api/projects/${projectId}`,
  );
  return response.data.data;
}

// 创建项目 overviewPage
export async function createProject(
  request: CreateProjectRequest,
): Promise<ProjectDetailResponse> {
  const response = await apiClient.post<
    ApiSuccessResponse<ProjectDetailResponse>
  >("/api/projects", request);
  return response.data.data;
}

// 编辑更新项目 detailPage
export async function updateProject(
  projectId: number,
  request: UpdateProjectRequest,
): Promise<ProjectDetailResponse> {
  const response = await apiClient.patch<
    ApiSuccessResponse<ProjectDetailResponse>
  >(`/api/projects/${projectId}`, request);
  return response.data.data;
}

// Set whether the current user has favorited a project.
export async function setProjectFavorite(
  projectId: number,
  isFavorite: boolean,
): Promise<boolean> {
  const url = `/api/projects/${projectId}/favorite`;
  const response = isFavorite
    ? await apiClient.put<ApiSuccessResponse<{ isFavorite: boolean }>>(url)
    : await apiClient.delete<ApiSuccessResponse<{ isFavorite: boolean }>>(url);
  return response.data.data.isFavorite;
}
