import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driverApi } from "../api/driver-api";
import { Driver } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const DRIVER_QUERY_KEYS = {
  all: ["drivers"] as const,
  lists: () => [...DRIVER_QUERY_KEYS.all, "list"] as const,
  list: (params: any) => [...DRIVER_QUERY_KEYS.lists(), params] as const,
  details: () => [...DRIVER_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...DRIVER_QUERY_KEYS.details(), id] as const,
};

/**
 * Hook for fetching paginated and filtered drivers
 */
export const useDrivers = (params?: { limit?: number; offset?: number; search?: string; status?: string }) => {
  return useQuery({
    queryKey: DRIVER_QUERY_KEYS.list(params || {}),
    queryFn: () => driverApi.getAll(params),
  });
};

/**
 * Hook for fetching a single driver by ID
 */
export const useDriver = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: DRIVER_QUERY_KEYS.detail(id),
    queryFn: () => driverApi.getById(id),
    enabled: options?.enabled ?? !!id,
  });
};

/**
 * Hook for creating a new driver
 */
export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: FormData) => driverApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_QUERY_KEYS.lists() });
      toast({ title: "Success", description: "Driver created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create driver",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating an existing driver
 */
export const useUpdateDriver = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Driver>) => driverApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_QUERY_KEYS.all });
      toast({ title: "Success", description: "Driver updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update driver",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting a driver
 */
export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => driverApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_QUERY_KEYS.all });
      toast({ title: "Success", description: "Driver deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete driver",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for uploading / replacing a driver's profile photo
 */
export const useUpdateDriverPhoto = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (photo: File) => driverApi.uploadPhoto(id, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_QUERY_KEYS.detail(id) });
      toast({ title: "Photo updated", description: "Driver profile photo has been updated." });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload photo",
        variant: "destructive",
      });
    },
  });
};

export const useDriverRatings = (driverId: string, params?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: [...DRIVER_QUERY_KEYS.detail(driverId), "ratings", params],
    queryFn: () => driverApi.getDriverRatings(driverId, params),
    enabled: !!driverId,
  });
};
