import { AdminUser } from "@/types";
import { storageService, STORAGE_KEYS } from "@/utils/storage";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

const AUTH_KEY = STORAGE_KEYS.AUTH;

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
}

const getInitialState = (): AuthState => {
  const stored = storageService.get<AuthState>(AUTH_KEY);
  const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

  if (stored && stored.isAuthenticated && stored.user && token) {
    return stored;
  }

  // If token is missing but state says authenticated, clear state
  if (stored?.isAuthenticated && !token) {
    storageService.remove(AUTH_KEY);
  }

  return {
    user: null,
    isAuthenticated: false,
    rememberMe: false,
  };
};

export const authService = {
  login: async (
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
    try {
      // 1. Login to get Tokens
      console.log("Attempting login with:", email);
      const loginResponse = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      console.log("Login Response Data:", loginResponse.data);
      const { accessToken, refreshToken } = loginResponse.data;

      // 2. Store Tokens
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("auth_token", accessToken);
      storage.setItem("refresh_token", refreshToken);

      // 3. Fetch User Details
      console.log("Fetching user profile...");
      const userResponse = await apiClient.get<any>(API_ENDPOINTS.AUTH.ME); // Use any to allow mapping
      console.log("User Profile Response:", userResponse.data);

      const rawUser = userResponse.data;

      // Map Backend response to Frontend AdminUser Type
      const user: AdminUser = {
        ...rawUser,
        name: rawUser.fullName || rawUser.email, // Map fullName to name
        roleName: rawUser.role?.name,
        roleSlug: rawUser.role?.name, // Use name as slug if slug is missing
        permissions: rawUser.role?.rolePermissions?.map((rp: any) => rp.permission?.slug) || [],
      };

      // 4. Update Auth State
      const authState: AuthState = {
        user,
        isAuthenticated: true,
        rememberMe,
      };

      // Always store user profile in localStorage for UI persistence (token availability determines session validity)
      storageService.set(AUTH_KEY, authState);

      return { success: true, user };
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.response) {
        console.error("Error Status:", error.response.status);
        console.error("Error Data:", error.response.data);
      }
      const errorMessage = error.response?.data?.message || "Invalid email or password";
      return { success: false, error: errorMessage };
    }
  },

  logout: (): void => {
    storageService.remove(AUTH_KEY);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
    // sessionStorage.clear(); // Careful clearing everything, explicit is safer
  },

  getCurrentUser: (): AdminUser | null => {
    const state = getInitialState();
    return state.user;
  },

  isAuthenticated: (): boolean => {
    const state = getInitialState();
    return state.isAuthenticated;
  },

  getAuthState: (): AuthState => {
    return getInitialState();
  },

  updateLastLogin: (): void => {
    const state = getInitialState();
    if (state.user) {
      state.user.lastLogin = new Date().toISOString();
      storageService.set(AUTH_KEY, state);
    }
  },

  hasPermission: (permissionSlug: string): boolean => {
    const state = getInitialState();
    if (!state.user) return false;
    // Super Admin check usually handled by backend, but frontend helper:
    if (state.user.roleSlug === "SUPER_ADMIN") return true;

    // Check permissions array (backend returns strings)
    // Adjust logic if permissions are objects, but AdminUser interface says string[]
    return state.user.permissions?.includes(permissionSlug) || false;
  },

  hasAnyPermission: (permissionSlugs: string[]): boolean => {
    const state = getInitialState();
    if (!state.user) return false;
    if (state.user.roleSlug === "SUPER_ADMIN") return true;

    return permissionSlugs.some((slug) => state.user?.permissions?.includes(slug));
  },

  // Mock credentials for quick testing - Optional to keep or remove
  getMockCredentials: () => ({
    email: "admin@gmail.com",
    password: "admin123",
  }),
};
