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
      const response = await apiClient.get<any>(API_ENDPOINTS.ROLES.GET_ALL, { params });
      const { data, total } = response.data;

      const mappedData = data.map((role: any) => ({
        ...role,
        name: role.name || (role as any).fullName || "Unnamed Role",
        slug: role.slug || role.name?.toUpperCase().replace(/\s+/g, "_") || "N/A",
      }));

      return { data: mappedData, total };
    } catch (error) {
      return { data: [], total: 0 };
    }
  },

  getById: async (id: string): Promise<Role | undefined> => {
    try {
      const response = await apiClient.get<Role>(API_ENDPOINTS.ROLES.GET_BY_ID(id));
      const role = response.data;
      return {
        ...role,
        name: role.name || (role as any).fullName || "Unnamed Role",
        slug: role.slug || role.name?.toUpperCase().replace(/\s+/g, "_") || "N/A",
      };
    } catch (error) {
      return undefined;
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

  update: async (id: string, roleData: Partial<Role> & { permissions?: string[] }): Promise<Role | undefined> => {
    try {
      const response = await apiClient.patch<Role>(API_ENDPOINTS.ROLES.UPDATE(id), roleData);
      const role = response.data;
      return {
        ...role,
        name: role.name || (role as any).fullName || "Unnamed Role",
        slug: role.slug || role.name?.toUpperCase().replace(/\s+/g, "_") || "N/A",
      };
    } catch (error) {
      return undefined;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(API_ENDPOINTS.ROLES.DELETE(id));
      return true;
    } catch (error) {
      return false;
    }
  },

  getRolePermissions: async (roleId: string): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>(API_ENDPOINTS.ROLES.PERMISSIONS(roleId));
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getAdminCountByRole: async (roleId: string): Promise<number> => {
    try {
      const response = await apiClient.get<{ count: number }>(API_ENDPOINTS.ROLES.ADMIN_COUNT(roleId));
      return response.data.count;
    } catch (error) {
      return 0;
    }
  },
};
