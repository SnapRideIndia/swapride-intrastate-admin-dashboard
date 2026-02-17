import { useAuth } from "@/providers/AuthContext";

export function usePermissions() {
  const { user } = useAuth();

  const permissions = user?.permissions ?? [];

  const hasPermission = (permissionSlug: string): boolean => {
    if (!user) return false;
    if (user.roleSlug === "SUPER_ADMIN") return true;
    if (permissions.includes("ALL")) return true;
    return permissions.includes(permissionSlug);
  };

  const hasAnyPermission = (permissionSlugs: string[]): boolean => {
    if (!user) return false;
    if (user.roleSlug === "SUPER_ADMIN") return true;
    if (permissions.includes("ALL")) return true;
    return permissionSlugs.some((slug) => permissions.includes(slug));
  };

  const hasAllPermissions = (permissionSlugs: string[]): boolean => {
    if (!user || !permissions.length) return false;
    if (permissions.includes("ALL")) return true;
    return permissionSlugs.every((slug) => permissions.includes(slug));
  };

  const isSuperAdmin = (): boolean => {
    return user?.roleSlug === "SUPER_ADMIN";
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    permissions,
    roleSlug: user?.roleSlug,
  };
}
