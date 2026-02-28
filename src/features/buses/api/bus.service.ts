import { Bus } from "@/types";
import { PaginatedResponse } from "@/types/pagination";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const busService = {
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Bus>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Bus>>(API_ENDPOINTS.FLEET.BUSES.GET_ALL, { params });
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

  getBusQR: async (busId: string): Promise<string> => {
    try {
      const response = await apiClient.get<string>(`/admin/bookings/bus-qr/${busId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch bus QR token";
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
