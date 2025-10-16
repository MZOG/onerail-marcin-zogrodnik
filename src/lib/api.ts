import { AxiosError } from "axios";
import { api } from "./axios";

export interface RegisterProps {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

interface ApiErrorResponse {
  message?: string;
}

export async function registerUser(
  payload: RegisterProps
): Promise<RegisterProps> {
  try {
    const { data } = await api.post<RegisterProps>("users", payload);
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      throw new Error(
        apiError.response?.data?.message || "Registration failed"
      );
    }
    throw new Error("An unexpected error occurred during registration");
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      if (apiError.response?.status === 401) {
        throw new Error("Invalid credentials");
      }
      throw new Error(apiError.response?.data?.message || "Login failed");
    }
    throw new Error("An unexpected error occurred during login");
  }
}

export async function refreshToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  try {
    const { data } = await api.post<RefreshTokenResponse>(
      "/auth/refresh-token",
      { refreshToken }
    );
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      throw new Error(
        apiError.response?.data?.message || "Failed to refresh token"
      );
    }
    throw new Error("An unexpected error occurred during token refresh");
  }
}
