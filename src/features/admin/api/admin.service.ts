import { AdminUser } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const adminService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: string;
  }): Promise<{ data: AdminUser[]; total: number }> => {
    try {
      const { page, limit, ...rest } = params || {};
      const offset = page && limit ? (page - 1) * limit : 0;
      
      const response = await apiClient.get<any>(API_ENDPOINTS.ADMINS.GET_ALL, { 
        params: { ...rest, offset, limit } 
      });
      
      const { data, pagination } = response.data;
      const total = pagination?.total || data.length || 0;

      const mappedData = data.map((admin: any) => ({
        ...admin,
        name: admin.fullName || admin.email,
        roleName: admin.role?.name,
        roleSlug: admin.role?.slug || admin.role?.name,
        permissions: admin.role?.rolePermissions?.map((rp: any) => rp.permission?.slug) || [],
        status: admin.status || "Active",
        phone: admin.phone || "N/A",
        profilePicture: admin.profileUrl,
      }));

      return { data: mappedData, total };
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
        profilePicture: admin.profileUrl,
      };
    } catch {
      return undefined;
    }
  },

  getByEmail: async (email: string): Promise<AdminUser | undefined> => {
    try {
      const response = await adminService.getAll({ search: email, limit: 1 });
      return response.data.find((a) => a.email.toLowerCase() === email.toLowerCase());
    } catch {
      return undefined;
    }
  },

  create: async (adminData: any): Promise<AdminUser> => {
    try {
      const isFormData = adminData instanceof FormData;
      const response = await apiClient.post<any>(API_ENDPOINTS.ADMINS.CREATE, adminData, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      const admin = response.data;
      return {
        ...admin,
        name: admin.fullName || admin.email,
        roleName: admin.role?.name,
        roleSlug: admin.role?.slug || admin.role?.name,
        permissions: admin.role?.rolePermissions?.map((rp: any) => rp.permission?.slug) || [],
        status: "Active",
        phone: "N/A",
        profilePicture: admin.profileUrl,
      };
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, adminData: Partial<any>): Promise<AdminUser | null> => {
    try {
      const isFormData = adminData instanceof FormData;
      let payload = adminData;

      if (!isFormData) {
        payload = { ...adminData };
        if (payload.name && !payload.fullName) {
          payload.fullName = payload.name;
          delete payload.name;
        }
      }

      const response = await apiClient.patch<any>(API_ENDPOINTS.ADMINS.UPDATE(id), payload, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      const admin = response.data;
      return {
        ...admin,
        name: admin.fullName || admin.email,
        roleName: admin.role?.name,
        roleSlug: admin.role?.slug || admin.role?.name,
        permissions: admin.role?.rolePermissions?.map((rp: any) => rp.permission?.slug) || [],
        status: admin.status || "Active",
        phone: admin.phone || "N/A",
        profilePicture: admin.profileUrl,
      };
    } catch {
      return null;
    }
  },

  updateMe: async (adminData: Partial<any>): Promise<AdminUser | null> => {
    try {
      const isFormData = adminData instanceof FormData;
      let payload = adminData;

      if (!isFormData) {
        // Map frontend 'name' to backend 'fullName' if provided
        payload = { ...adminData };
        if (payload.name && !payload.fullName) {
          payload.fullName = payload.name;
          delete payload.name;
        }
      }

      const response = await apiClient.patch<any>(API_ENDPOINTS.AUTH.ME, payload, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      const admin = response.data;
      return {
        ...admin,
        name: admin.fullName || admin.email,
        roleName: admin.role?.name,
        roleSlug: admin.role?.slug || admin.role?.name,
        permissions: admin.role?.rolePermissions?.map((rp: any) => rp.permission?.slug) || [],
        status: admin.status || "Active",
        phone: admin.phone || "N/A",
        profilePicture: admin.profileUrl,
      };
    } catch {
      return null;
    }
  },

  changePassword: async (passwordData: any): Promise<boolean> => {
    try {
      await apiClient.patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
      return true;
    } catch (error) {
      throw error;
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
        const response = await adminService.getAll({ limit: 1000 });
        const admins = response.data;
        return {
          totalAdmins: response.total,
          activeAdmins: admins.filter((a) => a.status === "Active").length,
          suspendedAdmins: admins.filter((a) => a.status === "Suspended").length,
          inactiveAdmins: admins.filter((a) => a.status === "Inactive").length,
          totalRoles: 0,
        };
      }
    } catch {
      return {
        totalAdmins: 0,
        activeAdmins: 0,
        suspendedAdmins: 0,
        inactiveAdmins: 0,
        totalRoles: 0,
      };
    }
  },

  resetPassword: async (id: string, newPassword: string): Promise<boolean> => {
    try {
      await apiClient.patch(API_ENDPOINTS.ADMINS.RESET_PASSWORD(id), { newPassword });
      return true;
    } catch (error) {
      throw error;
    }
  },
};
