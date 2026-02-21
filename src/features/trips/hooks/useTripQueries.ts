import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsApi } from "../api/trips-api";
import { LiveLocation, Trip } from "@/types";

export const TRIP_QUERY_KEYS = {
  all: ["trips"] as const,
  lists: () => [...TRIP_QUERY_KEYS.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...TRIP_QUERY_KEYS.lists(), params] as const,
  details: () => [...TRIP_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TRIP_QUERY_KEYS.details(), id] as const,
  liveLocations: () => [...TRIP_QUERY_KEYS.all, "live-locations"] as const,
  seats: (id: string) => [...TRIP_QUERY_KEYS.detail(id), "seats"] as const,
  stats: () => [...TRIP_QUERY_KEYS.all, "stats"] as const,
};

interface TripQueryParams {
  limit?: number;
  offset?: number;
  driverId?: string;
  status?: string;
  date?: string;
  search?: string;
  [key: string]: any;
}

export const useTrips = (params?: TripQueryParams) => {
  return useQuery({
    queryKey: TRIP_QUERY_KEYS.list(params || {}),
    queryFn: () => tripsApi.getAll(params),
  });
};

export const useTrip = (id: string) => {
  return useQuery({
    queryKey: TRIP_QUERY_KEYS.detail(id),
    queryFn: () => tripsApi.getById(id),
    enabled: !!id,
  });
};

export const useLiveLocations = () => {
  return useQuery({
    queryKey: TRIP_QUERY_KEYS.liveLocations(),
    queryFn: async () => {
      const data = await tripsApi.getLiveLocations();
      return data as LiveLocation[];
    },
    refetchInterval: 15000,
  });
};

export const useTripSeats = (id: string) => {
  return useQuery({
    queryKey: TRIP_QUERY_KEYS.seats(id),
    queryFn: () => tripsApi.getSeatAvailability(id),
    enabled: !!id,
  });
};

export const useTripStats = () => {
  return useQuery({
    queryKey: TRIP_QUERY_KEYS.stats(),
    queryFn: () => tripsApi.getStats(),
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Trip>) => tripsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Trip> }) => tripsApi.edit(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.detail(variables.id) });
    },
  });
};

export const useUpdateTripStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      tripsApi.updateStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.liveLocations() });
    },
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.lists() });
    },
  });
};
