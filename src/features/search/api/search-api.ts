import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export interface SearchTripsParams {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  tripDate: string;
  userLat: number;
  userLng: number;
  preferredTime?: string;
}

export const searchApi = {
  /**
   * Search for trips
   */
  searchTrips: async (params: SearchTripsParams) => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH.TRIPS, { params });
    return response.data;
  },

  /**
   * Get place autocomplete suggestions
   */
  getPlaceSuggestions: async (input: string, sessionToken?: string) => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH.PLACE_AUTOCOMPLETE, {
      params: { input, sessionToken },
    });
    return response.data;
  },
};
