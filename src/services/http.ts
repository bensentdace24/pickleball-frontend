import axios, { AxiosError } from "axios";
import type { ApiErrorBody } from "../types";

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]> | null;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject(
        new ApiError(
          data?.message ?? "Something went wrong.",
          status,
          data?.errors ?? null,
        ),
      );
    }
    return Promise.reject(
      new ApiError(
        "Cannot reach the server. Check that the API is running.",
        0,
      ),
    );
  },
);
