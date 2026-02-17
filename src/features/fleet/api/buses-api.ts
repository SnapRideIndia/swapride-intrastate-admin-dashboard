import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export interface Bus {
  id: string;
  busNumber: string;
  make?: string;
  model?: string;
  layoutId?: string;
}

export const busesApi = {
  /**
   * Get all buses
   */
  getAll: async (): Promise<Bus[]> => {
    const response = await apiClient.get(API_ENDPOINTS.FLEET.BUSES.GET_ALL);
    return response.data;
  },

  /**
   * Get bus by ID
   */
  getById: async (id: string): Promise<Bus> => {
    const response = await apiClient.get(API_ENDPOINTS.FLEET.BUSES.GET_BY_ID(id));
    return response.data;
  },
};
