import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../api/analytics.service";
import { AnalyticsFilters } from "@/types";

export const ANALYTICS_QUERY_KEYS = {
  all: ["analytics"] as const,
  dashboardStats: () => [...ANALYTICS_QUERY_KEYS.all, "dashboard-stats"] as const,
  busUtilization: () => [...ANALYTICS_QUERY_KEYS.all, "bus-utilization"] as const,
  summary: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "summary", filters] as const,
  trends: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "trends", filters] as const,
  routes: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "routes", filters] as const,
  fleet: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "fleet", filters] as const,
  distribution: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "distribution", filters] as const,
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.dashboardStats(),
    queryFn: () => analyticsService.getDashboardStats(),
  });
};

export const useBusUtilization = () => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.busUtilization(),
    queryFn: () => analyticsService.getBusUtilization(),
  });
};

export const useAnalyticsSummary = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.summary(filters),
    queryFn: () => analyticsService.getSummary(filters),
  });
};

export const useAnalyticsTrends = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.trends(filters),
    queryFn: () => analyticsService.getTrends(filters),
  });
};

export const useRoutePerformance = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.routes(filters),
    queryFn: () => analyticsService.getRoutePerformance(filters),
  });
};

export const useFleetPerformance = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.fleet(filters),
    queryFn: () => analyticsService.getFleetPerformance(filters),
  });
};

export const useDistributionMetrics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.distribution(filters),
    queryFn: () => analyticsService.getDistribution(filters),
  });
};
