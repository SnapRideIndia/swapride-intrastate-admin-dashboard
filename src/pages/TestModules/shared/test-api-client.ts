/**
 * Dedicated Axios instance for Test Module API calls.
 *
 * This client ALWAYS uses the logged-in TEST USER token (stored under
 * `test_user_token`), completely separate from the admin `apiClient`.
 *
 * Benefits:
 * - No token collision between admin and user sessions.
 * - No need to pass tokens manually to every API call.
 * - Centralized error handling specific to the test module.
 */
import axios from "axios";
import { TEST_USER_TOKEN_KEY, TEST_USER_REFRESH_TOKEN_KEY } from "../types";
import { API_ENDPOINTS } from "@/api/endpoints";
import { getGlobalSimulatorLogger } from "./SimulatorLogger";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const testApiClient = axios.create({
  baseURL,
  timeout: 30000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
testApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TEST_USER_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Technical Logging
    const logger = getGlobalSimulatorLogger();
    if (logger && config.url) {
      logger.apiRequest(config.method || "GET", config.url);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
testApiClient.interceptors.response.use(
  (response) => {
    // Technical Logging
    const logger = getGlobalSimulatorLogger();
    if (logger) {
      logger.apiResponse(response.status, response.data?.message || "Success");
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const logger = getGlobalSimulatorLogger();

    // Technical Logging for Errors
    if (logger) {
      const status = error.response?.status || "NETWORK";
      const message = error.response?.data?.message || error.message || "Unknown error";
      logger.apiError(status, message);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem(TEST_USER_REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        window.dispatchEvent(new CustomEvent("test-session-expired"));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${baseURL}${API_ENDPOINTS.TEST.AUTH.REFRESH}`, { refreshToken });
        localStorage.setItem(TEST_USER_TOKEN_KEY, data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem(TEST_USER_REFRESH_TOKEN_KEY, data.refreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return testApiClient(originalRequest);
      } catch {
        window.dispatchEvent(new CustomEvent("test-session-expired"));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
