import { useQuery } from "@tanstack/react-query";
import { tripsApi } from "../api/trips-api";

export const tripKeys = {
  all: ["trips"] as const,
  live: () => [...tripKeys.all, "live"] as const,
};

export const useLiveLocations = (options = {}) => {
  return useQuery({
    queryKey: tripKeys.live(),
    queryFn: () => tripsApi.getLiveLocations(),
    refetchInterval: 10000, // Refetch every 10 seconds for live tracking
    ...options,
  });
};
