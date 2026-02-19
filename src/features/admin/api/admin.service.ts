import { AdminUser } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const adminService = {
  getAll: async (): Promise<AdminUser[]> => {
    try {
      const response = await apiClient.get<AdminUser[]>(API_ENDPOINTS.ADMINS.GET_ALL);
      return response.data.map((admin: any) => ({
        ...admin,
        name: admin.fullName || admin.email,
        roleName: admin.role?.name,
        roleSlug: admin.role?.slug || admin.role?.name,
        permissions: admin.role?.rolePermissions?.map((rp: any) => rp.permission?.slug) || [],
        status: admin.status || "Active",
        phone: admin.phone || "N/A",
      }));
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<AdminUser | undefined> => {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.ADMINS.GET_BY_ID(id));
      const admin = response.data;
      return {
        ...admin,
        name: admin.fullName || admin.email,
        roleName: admin.role?.name,
        roleSlug: admin.role?.slug || admin.role?.name,
        permissions: admin.role?.rolePermissions?.map((rp: any) => rp.permission?.slug) || [],
        status: admin.status || "Active",
        phone: admin.phone || "N/A",
      };
    } catch (error) {
      return undefined;
    }
  },

  getByEmail: async (email: string): Promise<AdminUser | undefined> => {
    try {
      const admins = await adminService.getAll();
      return admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      return undefined;
    }
  },

  create: async (adminData: {
    email: string;
    fullName?: string;
    password: string;
    roleId?: string;
  }): Promise<AdminUser> => {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.ADMINS.CREATE, adminData);
      const admin = response.data;
      return {
        ...admin,
        name: admin.fullName || admin.email,
        roleName: admin.role?.name,
        roleSlug: admin.role?.slug || admin.role?.name,
        permissions: admin.role?.rolePermissions?.map((rp: any) => rp.permission?.slug) || [],
        status: "Active",
        phone: "N/A",
      };
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, adminData: Partial<{ roleId?: string; fullName?: string }>): Promise<AdminUser | null> => {
    try {
      const response = await apiClient.patch<any>(API_ENDPOINTS.ADMINS.UPDATE(id), adminData);
      const admin = response.data;
      return {
        ...admin,
        name: admin.fullName || admin.email,
        roleName: admin.role?.name,
        roleSlug: admin.role?.slug || admin.role?.name,
        permissions: admin.role?.rolePermissions?.map((rp: any) => rp.permission?.slug) || [],
        status: admin.status || "Active",
        phone: admin.phone || "N/A",
      };
    } catch (error) {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(API_ENDPOINTS.ADMINS.DELETE(id));
      return true;
    } catch (error: any) {
      if (error.response?.status === 400) {
        return false;
      }
      throw error;
    }
  },

  suspend: async (id: string): Promise<AdminUser | null> => {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.ADMINS.SUSPEND(id));
      return response.data;
    } catch {
      // Fallback if endpoint not available
      return adminService.update(id, { status: "Suspended" } as any);
    }
  },

  activate: async (id: string): Promise<AdminUser | null> => {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.ADMINS.ACTIVATE(id));
      return response.data;
    } catch {
      // Fallback if endpoint not available
      return adminService.update(id, { status: "Active" } as any);
    }
  },

  getStats: async () => {
    try {
      // Preference: Use dedicated stats endpoint if available
      try {
        const response = await apiClient.get(API_ENDPOINTS.ADMINS.STATS);
        return response.data;
      } catch {
        // Fallback to manual calculation
        const admins = await adminService.getAll();
        return {
          totalAdmins: admins.length,
          activeAdmins: admins.filter((a) => a.status === "Active").length,
          suspendedAdmins: admins.filter((a) => a.status === "Suspended").length,
          inactiveAdmins: admins.filter((a) => a.status === "Inactive").length,
          totalRoles: 0,
        };
      }
    } catch (error) {
      return {
        totalAdmins: 0,
        activeAdmins: 0,
        suspendedAdmins: 0,
        inactiveAdmins: 0,
        totalRoles: 0,
      };
    }
  },
};
