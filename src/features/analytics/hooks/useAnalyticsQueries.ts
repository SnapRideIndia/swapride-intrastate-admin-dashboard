import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../api/analytics.service";
import { 
  AnalyticsFilters, 
  DashboardStats, 
  AnalyticsSummary, 
  TrendData, 
  RoutePerformance, 
  FleetPerformance, 
  DistributionData, 
  KpiMetrics 
} from "@/types";

export const ANALYTICS_QUERY_KEYS = {
  all: ["analytics"] as const,
  dashboardStats: () => [...ANALYTICS_QUERY_KEYS.all, "dashboard-stats"] as const,
  busUtilization: () => [...ANALYTICS_QUERY_KEYS.all, "bus-utilization"] as const,
  summary: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "summary", filters] as const,
  trends: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "trends", filters] as const,
  routes: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "routes", filters] as const,
  fleet: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "fleet", filters] as const,
  distribution: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "distribution", filters] as const,
  kpi: (filters: AnalyticsFilters) => [...ANALYTICS_QUERY_KEYS.all, "kpi", filters] as const,
};

export const useDashboardStats = (options?: any) => {
  return useQuery<DashboardStats>({
    queryKey: ANALYTICS_QUERY_KEYS.dashboardStats(),
    queryFn: () => analyticsService.getDashboardStats(),
    ...options,
  });
};

export const useBusUtilization = (options?: any) => {
  return useQuery<any[]>({
    queryKey: ANALYTICS_QUERY_KEYS.busUtilization(),
    queryFn: () => analyticsService.getBusUtilization(),
    ...options,
  });
};

export const useAnalyticsSummary = (filters: AnalyticsFilters, options?: any) => {
  return useQuery<AnalyticsSummary>({
    queryKey: ANALYTICS_QUERY_KEYS.summary(filters),
    queryFn: () => analyticsService.getSummary(filters),
    ...options,
  });
};

export const useAnalyticsTrends = (filters: AnalyticsFilters, options?: any) => {
  return useQuery<TrendData[]>({
    queryKey: ANALYTICS_QUERY_KEYS.trends(filters),
    queryFn: () => analyticsService.getTrends(filters),
    ...options,
  });
};

export const useRoutePerformance = (filters: AnalyticsFilters, options?: any) => {
  return useQuery<RoutePerformance[]>({
    queryKey: ANALYTICS_QUERY_KEYS.routes(filters),
    queryFn: () => analyticsService.getRoutePerformance(filters),
    ...options,
  });
};

export const useFleetPerformance = (filters: AnalyticsFilters, options?: any) => {
  return useQuery<FleetPerformance[]>({
    queryKey: ANALYTICS_QUERY_KEYS.fleet(filters),
    queryFn: () => analyticsService.getFleetPerformance(filters),
    ...options,
  });
};

export const useDistributionMetrics = (filters: AnalyticsFilters, options?: any) => {
  return useQuery<DistributionData>({
    queryKey: ANALYTICS_QUERY_KEYS.distribution(filters),
    queryFn: () => analyticsService.getDistribution(filters),
    ...options,
  });
};

export const useAnalyticsKpi = (filters: AnalyticsFilters, options?: any) => {
  return useQuery<KpiMetrics>({
    queryKey: ANALYTICS_QUERY_KEYS.kpi(filters),
    queryFn: () => analyticsService.getKpiMetrics(filters),
    ...options,
  });
};
