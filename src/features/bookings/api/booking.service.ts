import { Booking } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const bookingService = {
  getAll: async (params?: {
    userId?: string;
    tripId?: string;
    status?: string;
    date?: string; // Format: 'today', 'yesterday', or YYYY-MM-DD
    boardingStatus?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Booking[]; total: number }> => {
    const response = await apiClient.get<{ data: Booking[]; total: number }>(API_ENDPOINTS.BOOKINGS.BASE, {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(API_ENDPOINTS.BOOKINGS.GET_BY_ID(id));
    return response.data;
  },

  cancel: async (id: string): Promise<{ message: string; refundAmount?: number }> => {
    const response = await apiClient.delete<{ message: string; refundAmount?: number }>(
      API_ENDPOINTS.BOOKINGS.CANCEL(id),
    );
    return response.data;
  },

  updateBoardingStatus: async (id: string, status: string): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(API_ENDPOINTS.BOOKINGS.BOARD(id), {
      status,
    });
    return response.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS);
    return response.data;
  },

  getStats: async (): Promise<{
    totalBookings: number;
    todayBookings: number;
    todayRevenue: number;
    pendingConfirmations: number;
  }> => {
    const response = await apiClient.get<{
      totalBookings: number;
      todayBookings: number;
      todayRevenue: number;
      pendingConfirmations: number;
    }>(API_ENDPOINTS.BOOKINGS.STATS);
    return response.data;
  },

  getTripPassengers: async (tripId: string): Promise<any[]> => {
    const response = await apiClient.get<any[]>(API_ENDPOINTS.TRIPS.GET_PASSENGERS(tripId));
    return response.data;
  },
};
