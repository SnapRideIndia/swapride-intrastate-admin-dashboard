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
  latitude: number;
  longitude: number;
  timestamp: string;
}

export const savedLocationsApi = {
  getSavedLocations: async (type?: "source" | "destination"): Promise<SavedLocation[]> => {
    try {
      const qs = type ? `?type=${type === "source" ? "pickup" : "dropoff"}` : "";
      const { data } = await testApiClient.get(`${API_ENDPOINTS.TEST.BOOKINGS.SAVED_LOCATIONS}${qs}`);
      return data;
    } catch (error) {
      console.error("Failed to fetch saved locations:", error);
      return [];
    }
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
