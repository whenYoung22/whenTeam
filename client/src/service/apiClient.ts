import axios, { type AxiosError } from "axios";
import type { ApiErrorResponse } from "@shared/index";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const message = error.response?.data?.error?.message;

    if (message) {
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
