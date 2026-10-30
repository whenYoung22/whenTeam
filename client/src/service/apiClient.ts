import axios, { type AxiosError } from "axios";
import type { ApiErrorResponse, ApiSuccessResponse } from "@shared/index";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/utils/authToken";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ApiSuccessResponse<{ token: string }>>("/api/auth/refresh")
      .then(({ data }) => {
        setAuthToken(data.data.token);
        return data.data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function isAuthEndpoint(url: string | undefined): boolean {
  return /^\/api\/auth\/(login|register|refresh|logout)(?:\?|$)/.test(url ?? "");
}

function getErrorMessage(error: unknown): string | undefined {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message;
  }
  return error instanceof Error ? error.message : undefined;
}

function clearSessionAndRedirect(): void {
  clearAuthToken();
  if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
    window.location.replace("/login");
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config;
    if (
      error.response?.status === 401 &&
      config &&
      !isAuthEndpoint(config.url)
    ) {
      const retryableConfig = config as typeof config & {
        __authRetried?: boolean;
      };
      if (retryableConfig.__authRetried) {
        clearSessionAndRedirect();
      } else {
        retryableConfig.__authRetried = true;
        try {
          const token = await refreshAccessToken();
          retryableConfig.headers.Authorization = `Bearer ${token}`;
          return apiClient(retryableConfig);
        } catch (refreshError) {
          clearSessionAndRedirect();
          return Promise.reject(
            new Error(getErrorMessage(refreshError) ?? "登录已失效，请重新登录"),
          );
        }
      }
    }

    const message = getErrorMessage(error);
    if (message) {
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
