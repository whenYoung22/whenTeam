import type {
  ApiSuccessResponse,
  LoginRequest,
  LoginResponse,
  User,
} from "@shared/index";
import apiClient from "@/service/apiClient";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>(
    "/api/auth/login",
    request,
  );
  return response.data.data;
}

export async function getCurrentUser(): Promise<User> {
  const response =
    await apiClient.get<ApiSuccessResponse<User>>("/api/auth/me");
  return response.data.data;
}
