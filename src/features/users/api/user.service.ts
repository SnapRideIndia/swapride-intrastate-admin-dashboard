import { User } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.USERS.GET_ALL);
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
};
