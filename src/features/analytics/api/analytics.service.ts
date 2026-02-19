import {
  AnalyticsFilters,
  DashboardStats,
  AnalyticsSummary,
  TrendData,
  RoutePerformance,
  FleetPerformance,
  DistributionData,
} from "@/types";
import { busService } from "@/features/buses";
import { driverService } from "@/features/drivers";
import { userService } from "@/features/users";
import { tripsApi } from "@/features/trips/api/trips-api";
import { bookingService } from "@/features/bookings";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const analyticsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.ANALYTICS.DASHBOARD_STATS);
      return response.data;
    } catch (error) {
      return {
        totalBuses: 0,
        activeBuses: 0,
        totalDrivers: 0,
        availableDrivers: 0,
        totalUsers: 0,
        activeTripsToday: 0,
        todayRevenue: 0,
        todayBookings: 0,
        busesOnTime: 0,
        busesDelayed: 0,
      };
    }
  },

  getBusUtilization: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(API_ENDPOINTS.ANALYTICS.BUS_UTILIZATION);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getSummary: async (filters: AnalyticsFilters): Promise<AnalyticsSummary> => {
    try {
      const response = await apiClient.get<AnalyticsSummary>(API_ENDPOINTS.ANALYTICS.SUMMARY, {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch summary analytics");
    }
  },

  getTrends: async (filters: AnalyticsFilters): Promise<TrendData[]> => {
    try {
      const response = await apiClient.get<TrendData[]>(API_ENDPOINTS.ANALYTICS.TRENDS, {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch trend data");
    }
  },

  getRoutePerformance: async (filters: AnalyticsFilters): Promise<RoutePerformance[]> => {
    try {
      const response = await apiClient.get<RoutePerformance[]>(API_ENDPOINTS.ANALYTICS.ROUTES, {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch route performance");
    }
  },

  getFleetPerformance: async (filters: AnalyticsFilters): Promise<FleetPerformance> => {
    try {
      const response = await apiClient.get<FleetPerformance>(API_ENDPOINTS.ANALYTICS.FLEET, {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch fleet performance");
    }
  },

  getDistribution: async (filters: AnalyticsFilters): Promise<DistributionData> => {
    try {
      const response = await apiClient.get<DistributionData>(API_ENDPOINTS.ANALYTICS.DISTRIBUTION, {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch distribution metrics");
    }
  },
};
