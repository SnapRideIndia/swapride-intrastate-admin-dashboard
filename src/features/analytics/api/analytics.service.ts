import { AnalyticsFilters, DashboardStats } from "@/types";
import { busService } from "@/features/buses";
import { routeService } from "@/features/routes";
import { driverService } from "@/features/drivers";
import { userService } from "@/features/users";
import { tripsApi } from "@/features/trips/api/trips-api";
import { bookingService } from "@/features/bookings";

export const analyticsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const buses = await busService.getAll();
      const drivers = await driverService.getAll();
      const users = await userService.getAll();
      const trips = await tripsApi.getAll();

      const today = new Date().toISOString().split("T")[0];
      const todayTrips = trips.filter((t) => t.date === today);

      return {
        totalBuses: buses.length,
        activeBuses: buses.filter((b) => b.status === "ACTIVE").length,
        totalDrivers: drivers.length,
        availableDrivers: drivers.filter((d) => d.status === "AVAILABLE").length,
        totalUsers: users.length,
        activeTripsToday: todayTrips.filter((d) => d.status === "In Progress").length,
        todayRevenue: todayTrips.reduce((sum, trip) => sum + trip.revenue, 0),
        todayBookings: bookingService.getTodayCount(),
        busesOnTime: todayTrips.filter((d) => d.tripStatus === "On Time" || d.tripStatus === "Early").length,
        busesDelayed: todayTrips.filter((d) => d.tripStatus === "Delayed").length,
      };
    } catch (error) {
      console.error("Failed to get dashboard stats:", error);
      // Return empty/default stats on error to prevent total crash
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

  getRevenueData: (filters: AnalyticsFilters) => {
    // Generate mock revenue data based on filters
    const days =
      filters.dateRange === "today"
        ? 1
        : filters.dateRange === "yesterday"
          ? 1
          : filters.dateRange === "last7days"
            ? 7
            : filters.dateRange === "last30days"
              ? 30
              : 30;

    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: Math.floor(Math.random() * 30000) + 20000,
        bookings: Math.floor(Math.random() * 150) + 100,
      });
    }
    return data;
  },

  getBookingTrend: (_filters: AnalyticsFilters) => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        bookings: Math.floor(Math.random() * 100) + 50,
      });
    }
    return data;
  },

  getRouteWiseRevenue: async () => {
    const routes = await routeService.getAll();
    return routes.map((route) => ({
      name: route.routeName.length > 20 ? route.routeName.substring(0, 20) + "..." : route.routeName,
      fullName: route.routeName,
      revenue: Math.floor(Math.random() * 100000) + 50000,
      bookings: Math.floor(Math.random() * 500) + 200,
    }));
  },

  getBusUtilization: async () => {
    const buses = await busService.getAll();
    return buses.slice(0, 6).map((bus) => ({
      busNumber: bus.busNumber,
      utilization: Math.floor(Math.random() * 30) + 70,
      trips: Math.floor(Math.random() * 50) + 20,
    }));
  },

  getPeakHours: () => {
    const hours = [];
    for (let i = 5; i <= 22; i++) {
      hours.push({
        hour: `${i}:00`,
        bookings: Math.floor(Math.random() * 50) + (i >= 7 && i <= 10 ? 40 : i >= 17 && i <= 20 ? 35 : 10),
      });
    }
    return hours;
  },

  getOccupancyRate: () => {
    return {
      average: 78,
      peak: 95,
      offPeak: 45,
      weekdayAvg: 82,
      weekendAvg: 65,
    };
  },

  getDelayStats: async () => {
    const trips = await tripsApi.getAll();
    const completed = trips.filter((d) => d.status === "Completed");
    const onTime = completed.filter((d) => d.tripStatus === "On Time" || d.tripStatus === "Early").length;
    const delayed = completed.filter((d) => d.tripStatus === "Delayed").length;

    return {
      onTimePercentage: completed.length > 0 ? Math.round((onTime / completed.length) * 100) : 0,
      delayedPercentage: completed.length > 0 ? Math.round((delayed / completed.length) * 100) : 0,
      averageDelay: 8, // minutes
      totalTrips: completed.length,
    };
  },

  getUserGrowth: () => {
    const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
    return months.map((month) => ({
      month,
      newUsers: Math.floor(Math.random() * 50) + 20,
      activeUsers: Math.floor(Math.random() * 200) + 100,
    }));
  },

  getTopRoutes: async (limit: number = 5) => {
    const routes = await routeService.getAll();
    return routes.slice(0, limit).map((route, index) => ({
      rank: index + 1,
      name: route.routeName,
      passengers: Math.floor(Math.random() * 1000) + 500,
      revenue: Math.floor(Math.random() * 50000) + 25000,
      occupancy: Math.floor(Math.random() * 20) + 75,
    }));
  },

  // Summary metrics
  getTotalRevenue: (_days: number = 30) => {
    return Math.floor(Math.random() * 500000) + 300000;
  },

  getTotalBookings: (_days: number = 30) => {
    return Math.floor(Math.random() * 3000) + 2000;
  },

  getAverageOccupancy: () => {
    return Math.floor(Math.random() * 15) + 75;
  },
};
