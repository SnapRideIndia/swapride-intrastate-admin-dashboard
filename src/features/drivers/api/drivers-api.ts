import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
}

export const driversApi = {
  /**
   * Get all drivers
   */
  getAll: async (): Promise<Driver[]> => {
    const response = await apiClient.get(API_ENDPOINTS.DRIVERS.GET_ALL);
    return response.data;
  },

  /**
   * Get driver by ID
   */
  getById: async (id: string): Promise<Driver> => {
    const response = await apiClient.get(API_ENDPOINTS.DRIVERS.GET_BY_ID(id));
    return response.data;
  },
};
