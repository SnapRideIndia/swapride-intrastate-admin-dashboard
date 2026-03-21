import { testApiClient } from "../../shared/test-api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export interface SavedLocation {
  id: string;
  userId: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface RecentSearch {
  id: string;
  type: "pickup" | "dropoff";
  address: string;
  /** Place name from backend (short label); use as title, address as description */
  place_name?: string | null;
  latitude: number;
  longitude: number;
  timestamp: string;
  /** True if this location is already in the user's saved locations */
  is_saved?: boolean;
  /** Id of the matching saved location when is_saved is true */
  saved_location_id?: string | null;
}

export const savedLocationsApi = {
  getTravelPreferenceLocations: async (type?: "source" | "destination"): Promise<SavedLocation[]> => {
    try {
      const qs = type ? `?type=${type === "source" ? "pickup" : "dropoff"}` : "";
      const { data } = await testApiClient.get(`${API_ENDPOINTS.TEST.BOOKINGS.TRAVEL_PREFERENCES_LOCATIONS}${qs}`);
      return data;
    } catch (error) {
      console.error("Failed to fetch travel preference locations:", error);
      return [];
    }
  },

  listAll: async (): Promise<SavedLocation[]> => {
    try {
      const { data } = await testApiClient.get(API_ENDPOINTS.TEST.USER.SAVED_LOCATIONS);
      return data;
    } catch (error) {
      console.error("Failed to list saved locations:", error);
      return [];
    }
  },

  create: async (dto: { label: string; address: string; latitude: number; longitude: number }): Promise<SavedLocation> => {
    const { data } = await testApiClient.post(API_ENDPOINTS.TEST.USER.SAVED_LOCATIONS, dto);
    return data;
  },

  update: async (
    id: string,
    dto: { label?: string; address?: string; latitude?: number; longitude?: number },
  ): Promise<SavedLocation> => {
    const { data } = await testApiClient.patch(API_ENDPOINTS.TEST.USER.SAVED_LOCATION_BY_ID(id), dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await testApiClient.delete(API_ENDPOINTS.TEST.USER.SAVED_LOCATION_BY_ID(id));
  },

  getSavedLocations: async (type?: "source" | "destination"): Promise<SavedLocation[]> => {
    return savedLocationsApi.getTravelPreferenceLocations(type);
  },

  getRecentSearches: async (type?: "source" | "destination"): Promise<RecentSearch[]> => {
    try {
      const qs = type ? `?type=${type === "source" ? "pickup" : "dropoff"}` : "";
      const { data } = await testApiClient.get(`${API_ENDPOINTS.TEST.BOOKINGS.RECENT_SEARCHES}${qs}`);
      return data;
    } catch (error) {
      console.error("Failed to fetch recent searches:", error);
      return [];
    }
  },
};
