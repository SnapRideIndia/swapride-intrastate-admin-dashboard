import { User } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const userService = {
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
  }): Promise<{
    users: User[];
    total: number;
    activeUsersCount: number;
    blockedUsersCount: number;
    totalBookingsCount: number;
  }> => {
    const { data } = await apiClient.get(API_ENDPOINTS.USERS.GET_ALL, { params });
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(API_ENDPOINTS.USERS.GET_BY_ID(id));
    return data;
  },

  blockUser: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(id), { status: "BLOCKED" });
    return data;
  },

  unblockUser: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(id), { status: "ACTIVE" });
    return data;
  },

  suspendUser: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(id), { status: "SUSPENDED" });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
  },

  getProfile: async (): Promise<any> => {
    const { data } = await apiClient.get(API_ENDPOINTS.AUTH.GET_PROFILE);
    return data;
  },
};
