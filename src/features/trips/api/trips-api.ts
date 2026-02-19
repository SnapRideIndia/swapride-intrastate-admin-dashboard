import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { Trip } from "@/types";

export const tripsApi = {
  /**
   * Get all trips
   */
  getAll: async (): Promise<Trip[]> => {
    const response = await apiClient.get(API_ENDPOINTS.TRIPS.GET_ALL);
    return response.data;
  },

  /**
   * Get trip by ID
   */
  getById: async (id: string): Promise<Trip> => {
    const response = await apiClient.get(API_ENDPOINTS.TRIPS.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create a new trip
   */
  create: async (tripData: any): Promise<Trip> => {
    const response = await apiClient.post(API_ENDPOINTS.TRIPS.CREATE, tripData);
    return response.data;
  },

  /**
   * Edit a scheduled trip
   */
  edit: async (id: string, tripData: any): Promise<Trip> => {
    const response = await apiClient.patch(API_ENDPOINTS.TRIPS.EDIT(id), tripData);
    return response.data;
  },

  /**
   * Update trip status
   */
  updateStatus: async (id: string, status: string, cancellationReason?: string): Promise<Trip> => {
    const response = await apiClient.patch(API_ENDPOINTS.TRIPS.UPDATE_STATUS(id), {
      status,
      cancellationReason,
    });
    return response.data;
  },

  /**
   * Get seat availability for a trip
   */
  getSeatAvailability: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.TRIPS.GET_SEATS(id));
    return response.data;
  },

  /**
   * Get all live bus locations
   */
  getLiveLocations: async (): Promise<any[]> => {
    const response = await apiClient.get(API_ENDPOINTS.TRIPS.GET_LIVE_LOCATIONS);
    return response.data;
  },

  /**
   * Delete a trip
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.TRIPS.DELETE(id));
  },
};
