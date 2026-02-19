import { Bus } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const busService = {
  getAll: async (): Promise<Bus[]> => {
    try {
      const response = await apiClient.get<Bus[]>(API_ENDPOINTS.FLEET.BUSES.GET_ALL);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch buses";
      throw new Error(message);
    }
  },

  getById: async (id: string): Promise<Bus> => {
    try {
      const response = await apiClient.get<Bus>(API_ENDPOINTS.FLEET.BUSES.GET_BY_ID(id));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to fetch bus ${id}`;
      throw new Error(message);
    }
  },

  create: async (busData: Partial<Bus>): Promise<Bus> => {
    try {
      const response = await apiClient.post<Bus>(API_ENDPOINTS.FLEET.BUSES.CREATE, busData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create bus";
      throw new Error(message);
    }
  },

  update: async (id: string, busData: Partial<Bus>): Promise<Bus> => {
    try {
      const response = await apiClient.patch<Bus>(API_ENDPOINTS.FLEET.BUSES.UPDATE(id), busData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to update bus ${id}`;
      throw new Error(message);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(API_ENDPOINTS.FLEET.BUSES.DELETE(id));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to delete bus ${id}`;
      throw new Error(message);
    }
  },

  // Analytics - Mock for now as backend doesn't have a dedicated endpoint yet
  getBusAnalytics: async (_busId: string) => {
    return {
      totalRevenue: Math.floor(Math.random() * 500000) + 100000,
      monthlyRevenue: Math.floor(Math.random() * 50000) + 10000,
      totalBookings: Math.floor(Math.random() * 5000) + 1000,
      monthlyBookings: Math.floor(Math.random() * 500) + 100,
      occupancyRate: Math.floor(Math.random() * 30) + 70,
      dailyUtilization: Math.floor(Math.random() * 20) + 80,
      tripsCompleted: Math.floor(Math.random() * 1000) + 200,
    };
  },
};
