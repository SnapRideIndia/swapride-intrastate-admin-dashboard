import { StopSuggestion, SuggestionStatus } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const suggestionService = {
  getAll: async (): Promise<StopSuggestion[]> => {
    try {
      const response = await apiClient.get<StopSuggestion[]>(API_ENDPOINTS.SUGGESTIONS.GET_ALL);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch suggestions";
      console.error(message);
      throw new Error(message);
    }
  },

  getById: async (id: string): Promise<StopSuggestion> => {
    try {
      const response = await apiClient.get<StopSuggestion>(API_ENDPOINTS.SUGGESTIONS.GET_BY_ID(id));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to fetch suggestion ${id}`;
      console.error(message);
      throw new Error(message);
    }
  },

  update: async (
    id: string,
    suggestionData: { status: SuggestionStatus; adminNotes?: string },
  ): Promise<StopSuggestion> => {
    try {
      const response = await apiClient.patch<StopSuggestion>(API_ENDPOINTS.SUGGESTIONS.UPDATE(id), suggestionData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to update suggestion ${id}`;
      console.error(message);
      throw new Error(message);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(API_ENDPOINTS.SUGGESTIONS.DELETE(id));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to delete suggestion ${id}`;
      console.error(message);
      throw new Error(message);
    }
  },
};
