import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { Driver, DriverRating } from "@/types";

export const driverApi = {
  /**
   * Get all drivers (paginated and filtered)
   */
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
  }): Promise<{ drivers: Driver[]; total: number }> => {
    const { data } = await apiClient.get(API_ENDPOINTS.DRIVERS.GET_ALL, { params });
    return data;
  },

  /**
   * Get driver by ID
   */
  getById: async (id: string): Promise<Driver> => {
    const { data } = await apiClient.get(API_ENDPOINTS.DRIVERS.GET_BY_ID(id));
    return data;
  },

  /**
   * Create a new driver
   */
  create: async (driverData: FormData): Promise<Driver> => {
    const { data } = await apiClient.post(API_ENDPOINTS.DRIVERS.CREATE, driverData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  /**
   * Update an existing driver
   */
  update: async (id: string, driverData: Partial<Driver>): Promise<Driver> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.DRIVERS.UPDATE(id), driverData);
    return data;
  },

  /**
   * Delete a driver
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.DRIVERS.DELETE(id));
  },

  /**
   * Upload / replace driver profile photo
   */
  uploadPhoto: async (id: string, photo: File): Promise<Driver> => {
    const formData = new FormData();
    formData.append("photo", photo);
    const { data } = await apiClient.patch(API_ENDPOINTS.DRIVERS.UPLOAD_PHOTO(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getDriverRatings: async (
    driverId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<{ data: DriverRating[]; total: number }> => {
    const { data } = await apiClient.get(API_ENDPOINTS.DRIVERS.RATINGS(driverId), { params });
    return data;
  },
};
