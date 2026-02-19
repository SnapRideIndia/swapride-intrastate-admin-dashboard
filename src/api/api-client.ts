import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "@/api/endpoints";
import { ROUTES } from "@/constants/routes";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Detect the type of connectivity issue
    const hasNoResponse = !error.response;
    const isNetworkError = error.code === "ERR_NETWORK";
    const isConnectionRefused = error.code === "ERR_CONNECTION_REFUSED";
    const isDNSError = error.code === "ENOTFOUND";

    // Check if user has internet connectivity
    const hasInternet = navigator.onLine;

    if (hasNoResponse && (isNetworkError || isConnectionRefused || isDNSError)) {
      const currentPath = window.location.pathname;

      // Skip redirect if already on an error page
      if (currentPath === ROUTES.NO_NETWORK || currentPath === ROUTES.BACKEND_OFFLINE) {
        return Promise.reject(error);
      }

      sessionStorage.setItem("pre-network-error-path", currentPath);

      if (!hasInternet) {
        // User has no internet connection
        window.location.replace(ROUTES.NO_NETWORK);
      } else if (isConnectionRefused || isNetworkError) {
        // User has internet but backend is not responding
        window.location.replace(ROUTES.BACKEND_OFFLINE);
      } else {
        // DNS or other network issue
        window.location.replace(ROUTES.NO_NETWORK);
      }

      return Promise.reject(error);
    }

    // Timeout Error - show toast only
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      window.dispatchEvent(
        new CustomEvent("api-error", {
          detail: {
            type: "timeout",
            message: "Request timed out. Please try again.",
          },
        }),
      );
      return Promise.reject(error);
    }

    // 401 Unauthorized - Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");

      if (!refreshToken) {
        window.dispatchEvent(new CustomEvent("session-expired"));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        const storage = localStorage.getItem("auth_token") ? localStorage : sessionStorage;

        storage.setItem("auth_token", accessToken);
        storage.setItem("refresh_token", newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent("session-expired"));
        return Promise.reject(refreshError);
      }
    }

    // 403 Forbidden - Permission Denied
    if (error.response?.status === 403) {
      const isGetRequest = (originalRequest as any).method?.toLowerCase() === "get";

      if (!isGetRequest) {
        window.dispatchEvent(
          new CustomEvent("permission-denied", {
            detail: {
              message: "You do not have permission to perform this action.",
              url: (originalRequest as any).url,
            },
          }),
        );
      }
    }

    // 500 Internal Server Error - show toast
    if (error.response?.status === 500) {
      window.dispatchEvent(
        new CustomEvent("api-error", {
          detail: {
            type: "server",
            message: "Something went wrong on our end. Please try again later.",
          },
        }),
      );
    }

    // 400 Bad Request - show toast
    if (error.response?.status === 400) {
      const errorMessage = (error.response.data as any)?.message || "Invalid request. Please check your input.";
      window.dispatchEvent(
        new CustomEvent("api-error", {
          detail: {
            type: "validation",
            message: errorMessage,
          },
        }),
      );
    }

    return Promise.reject(error);
  },
);

export default apiClient;
