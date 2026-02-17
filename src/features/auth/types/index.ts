import { AdminUser } from "@/types";

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: AdminUser;
  error?: string;
}
