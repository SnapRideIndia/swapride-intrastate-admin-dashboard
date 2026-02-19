import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminUser } from "@/types";
import { authService } from "@/features/auth/api/auth.service";

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permissionSlug: string) => boolean;
  hasAnyPermission: (permissionSlugs: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const authState = authService.getAuthState();
    if (authState.isAuthenticated && authState.user) {
      setUser(authState.user);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const result = await authService.login(email, password, rememberMe);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permissionSlug: string): boolean => {
    if (!user || !user.permissions) return false;
    const permissions = user.permissions ?? [];
    if (permissions.includes("ALL")) return true;
    return permissions.includes(permissionSlug);
  };

  const hasAnyPermission = (permissionSlugs: string[]): boolean => {
    if (!user || !user.permissions) return false;
    const permissions = user.permissions ?? [];
    if (permissions.includes("ALL")) return true;
    return permissionSlugs.some((slug) => permissions.includes(slug));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, hasPermission, hasAnyPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
