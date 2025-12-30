import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { AuthTokens } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}


class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true, // MUST be enabled for CSRF + cookies
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // ✅ default header
      },
    });

    // Load tokens from localStorage
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
      this.refreshToken = localStorage.getItem("refresh_token");
    }

    // ---------------------------
    // REQUEST INTERCEPTOR
    // ---------------------------
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }

        // Add Authorization
        if (this.accessToken) {
          config.headers.set("Authorization", `Bearer ${this.accessToken}`);
        }

        // Add CSRF Token
        const csrfToken = this.getCookie("csrftoken");
        if (csrfToken) {
          config.headers.set("X-CSRFToken", csrfToken);
        }

        // Add ngrok skip header
        config.headers.set("ngrok-skip-browser-warning", "true");

        return config;
      },
      (error) => Promise.reject(error)
    );

    // ---------------------------
    // RESPONSE INTERCEPTOR
    // ---------------------------
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
              originalRequest.headers["ngrok-skip-browser-warning"] = "true";
            }
            return this.client(originalRequest);
          } catch {
            this.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // --------------------------------------
  // COOKIE PARSER (Fixes CSRF extraction)
  // --------------------------------------
  private getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(";").shift()!;
    return null;
  }

  // --------------------------------------
  // SET TOKENS
  // --------------------------------------
  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
    }
  }

  // --------------------------------------
  // CLEAR TOKENS
  // --------------------------------------
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }

  // --------------------------------------
  // REFRESH TOKEN API CALL
  // --------------------------------------
  async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) return null;

    try {
      const response = await axios.post(
        `${API_URL}/accounts/token/refresh/`,
        { refresh: this.refreshToken },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true", // ✅ added here
          },
        }
      );

      const { access, refresh } = response.data;

      this.setTokens({ access, refresh });
      return access;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  // -----------------------------
  // AUTH HELPERS
  // -----------------------------
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getCurrentUser() {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  saveUser(user: unknown) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  // -----------------------------
  // HTTP Methods
  // -----------------------------
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async uploadFile<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "ngrok-skip-browser-warning": "true", // ✅ added
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

