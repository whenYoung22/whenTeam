import type {
  ApiSuccessResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@shared/index";
import apiClient from "@/service/apiClient";


// 实现登录
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>(
    "/api/auth/login",
    request,
  );
  return response.data.data;
}

// 实现注册
export async function register(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await apiClient.post<ApiSuccessResponse<RegisterResponse>>(
    "/api/auth/register",
    request,
  );
  return response.data.data;
}
