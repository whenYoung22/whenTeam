import type { ApiSuccessResponse, UserSummary, User } from "@shared/index";
import apiClient from "@/service/apiClient";


// 获取当前登录的用户
export async function getCurrentUser(): Promise<User> {
  const response =
    await apiClient.get<ApiSuccessResponse<User>>("/api/me");
  return response.data.data;
}

// 获取所有注册的用户
export async function getUsers(): Promise<UserSummary[]> {
  const response =
    await apiClient.get<ApiSuccessResponse<UserSummary[]>>("/api/users");
  return response.data.data;
}
