import axios, { type AxiosError } from "axios";
import type { ApiErrorResponse } from "@shared/index";
import { clearAuthToken, getAuthToken } from "@/utils/authToken";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    const message = error.response?.data?.error?.message;

    if (message) {
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
