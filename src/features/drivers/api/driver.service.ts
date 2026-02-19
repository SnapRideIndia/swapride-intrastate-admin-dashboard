import { Driver } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const driverService = {
  getAll: async (): Promise<Driver[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.DRIVERS.GET_ALL);
    return data;
  },

  getById: async (id: string): Promise<Driver> => {
    const { data } = await apiClient.get(API_ENDPOINTS.DRIVERS.GET_BY_ID(id));
    return data;
  },

  create: async (driverData: FormData): Promise<Driver> => {
    const { data } = await apiClient.post(API_ENDPOINTS.DRIVERS.CREATE, driverData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  update: async (id: string, driverData: Partial<Driver>): Promise<Driver> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.DRIVERS.UPDATE(id), driverData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.DRIVERS.DELETE(id));
  },

  getDriverPerformance: async (driverId: string) => {
    // This endpoint might not exist yet, keeping mock or basic returns
    try {
      const driver = await driverService.getById(driverId);
      return {
        totalTrips: driver.totalTrips || 0,
        rating: driver.rating || 0,
        onTimePercentage: 0, // Backend calculation needed
        completionRate: 0, // Backend calculation needed
      };
    } catch (error) {
      return null;
    }
  },
};
