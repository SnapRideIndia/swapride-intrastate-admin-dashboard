import { Route, Stop } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const routeService = {
  getAll: async (): Promise<Route[]> => {
    try {
      const response = await apiClient.get<Route[]>(API_ENDPOINTS.ROUTES.GET_ALL);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch routes";
      console.error(message);
      throw new Error(message);
    }
  },

  getById: async (id: string): Promise<Route> => {
    try {
      const response = await apiClient.get<Route>(API_ENDPOINTS.ROUTES.GET_BY_ID(id));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to fetch route ${id}`;
      console.error(message);
      throw new Error(message);
    }
  },

  create: async (routeData: Partial<Route>): Promise<Route> => {
    try {
      const response = await apiClient.post<Route>(API_ENDPOINTS.ROUTES.CREATE, routeData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create route";
      console.error(message);
      throw new Error(message);
    }
  },

  update: async (id: string, routeData: Partial<Route>): Promise<Route> => {
    try {
      const response = await apiClient.patch<Route>(API_ENDPOINTS.ROUTES.UPDATE(id), routeData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to update route ${id}`;
      console.error(message);
      throw new Error(message);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(API_ENDPOINTS.ROUTES.DELETE(id));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to delete route ${id}`;
      console.error(message);
      throw new Error(message);
    }
  },

  syncMetrics: async (id: string): Promise<boolean> => {
    try {
      await apiClient.post(API_ENDPOINTS.ROUTES.SYNC_METRICS(id));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to sync metrics for route ${id}`;
      console.error(message);
      throw new Error(message);
    }
  },

  // Stop Management
  addStop: async (routeId: string, stopData: any): Promise<Stop> => {
    try {
      const response = await apiClient.post<Stop>(API_ENDPOINTS.ROUTES.ADD_STOP(routeId), stopData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to add stop to route ${routeId}`;
      console.error(message);
      throw new Error(message);
    }
  },

  updateStop: async (stopId: string, stopData: any): Promise<Stop> => {
    try {
      const response = await apiClient.patch<Stop>(API_ENDPOINTS.ROUTES.STOPS.UPDATE(stopId), stopData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to update stop ${stopId}`;
      console.error(message);
      throw new Error(message);
    }
  },

  deleteStop: async (stopId: string): Promise<boolean> => {
    try {
      await apiClient.delete(API_ENDPOINTS.ROUTES.STOPS.DELETE(stopId));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to delete stop ${stopId}`;
      console.error(message);
      throw new Error(message);
    }
  },

  reorderStops: async (routeId: string, orderedStopIds: string[]): Promise<boolean> => {
    try {
      await apiClient.post(API_ENDPOINTS.ROUTES.REORDER_STOPS(routeId), { orderedStopIds });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to reorder stops for route ${routeId}`;
      console.error(message);
      throw new Error(message);
    }
  },

  // Point Management
  getAllPoints: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(API_ENDPOINTS.POINTS.GET_ALL);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch points";
      console.error(message);
      throw new Error(message);
    }
  },

  createPoint: async (pointData: any): Promise<any> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.POINTS.CREATE, pointData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create point";
      console.error(message);
      throw new Error(message);
    }
  },

  updatePoint: async (id: string, pointData: any): Promise<any> => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.POINTS.UPDATE(id), pointData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to update point ${id}`;
      console.error(message);
      throw new Error(message);
    }
  },

  deletePoint: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(API_ENDPOINTS.POINTS.DELETE(id));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to delete point ${id}`;
      console.error(message);
      throw new Error(message);
    }
  },

  // Point Image Specific Management
  addPointImage: async (pointId: string, imageData: FormData): Promise<any> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.POINTS.IMAGES.CREATE(pointId), imageData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to add image to point ${pointId}`;
      console.error(message);
      throw new Error(message);
    }
  },

  removePointImage: async (pointId: string, imageId: string): Promise<boolean> => {
    try {
      await apiClient.delete(API_ENDPOINTS.POINTS.IMAGES.DELETE(pointId, imageId));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to remove image ${imageId}`;
      console.error(message);
      throw new Error(message);
    }
  },

  setPrimaryPointImage: async (pointId: string, imageId: string): Promise<boolean> => {
    try {
      await apiClient.patch(API_ENDPOINTS.POINTS.IMAGES.SET_PRIMARY(pointId, imageId));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to set primary image ${imageId}`;
      console.error(message);
      throw new Error(message);
    }
  },

  reorderPointImages: async (pointId: string, imageOrders: { imageId: string; order: number }[]): Promise<boolean> => {
    try {
      await apiClient.patch(API_ENDPOINTS.POINTS.IMAGES.REORDER(pointId), imageOrders);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to reorder images for point ${pointId}`;
      console.error(message);
      throw new Error(message);
    }
  },
};
