import { Role } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const roleService = {
  getAll: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Role[]; total: number }> => {
    try {
      const { page, limit, ...rest } = params || {};
      const offset = page && limit ? (page - 1) * limit : 0;
      
      const response = await apiClient.get<any>(API_ENDPOINTS.ROLES.GET_ALL, { 
        params: { ...rest, offset, limit } 
      });
      
      const { data, pagination } = response.data;
      const total = pagination?.total || data.length || 0;

      const mappedData = data.map((role: any) => ({
        ...role,
        name: role.name || (role as any).fullName || "Unnamed Role",
        slug: role.slug || role.name?.toUpperCase().replace(/\s+/g, "_") || "N/A",
      }));

      return { data: mappedData, total };
    } catch {
      return { data: [], total: 0 };
    }
  },

  getById: async (id: string): Promise<Role> => {
    try {
      const response = await apiClient.get<Role>(API_ENDPOINTS.ROLES.GET_BY_ID(id));
      const role = response.data;
      return {
        ...role,
        name: role.name || (role as any).fullName || "Unnamed Role",
        slug: role.slug || role.name?.toUpperCase().replace(/\s+/g, "_") || "N/A",
      };
    } catch (error) {
      console.error("Error fetching role:", error);
      throw error;
    }
  },

  create: async (roleData: Partial<Role> & { permissions?: string[] }): Promise<Role> => {
    try {
      const response = await apiClient.post<Role>(API_ENDPOINTS.ROLES.CREATE, roleData);
      const role = response.data;
      return {
        ...role,
        name: role.name || (role as any).fullName || "Unnamed Role",
        slug: role.slug || role.name?.toUpperCase().replace(/\s+/g, "_") || "N/A",
      };
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, roleData: Partial<Role> & { permissions?: string[] }): Promise<Role> => {
    try {
      const response = await apiClient.patch<Role>(API_ENDPOINTS.ROLES.UPDATE(id), roleData);
      const role = response.data;
      return {
        ...role,
        name: role.name || (role as any).fullName || "Unnamed Role",
        slug: role.slug || role.name?.toUpperCase().replace(/\s+/g, "_") || "N/A",
      };
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(API_ENDPOINTS.ROLES.DELETE(id));
      return true;
    } catch {
      return false;
    }
  },

  getRolePermissions: async (roleId: string): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>(API_ENDPOINTS.ROLES.PERMISSIONS(roleId));
      return response.data;
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      throw error;
    }
  },

  getAdminCountByRole: async (roleId: string): Promise<number> => {
    try {
      const response = await apiClient.get<{ count: number }>(API_ENDPOINTS.ROLES.ADMIN_COUNT(roleId));
      return response.data.count;
    } catch {
      return 0;
    }
  },
};
