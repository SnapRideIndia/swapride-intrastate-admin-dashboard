import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { busService } from "../api/bus.service";
import { Bus } from "@/types";

export const busKeys = {
  all: ["buses"] as const,
  lists: () => [...busKeys.all, "list"] as const,
  details: () => [...busKeys.all, "detail"] as const,
  detail: (id: string) => [...busKeys.details(), id] as const,
};

export const useBuses = () => {
  return useQuery({
    queryKey: busKeys.lists(),
    queryFn: () => busService.getAll(),
  });
};

export const useBus = (id: string) => {
  return useQuery({
    queryKey: busKeys.detail(id),
    queryFn: () => busService.getById(id),
    enabled: !!id,
  });
};

export const useCreateBus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Bus>) => busService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: busKeys.lists() });
    },
  });
};

export const useUpdateBus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bus> }) => busService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: busKeys.lists() });
      queryClient.invalidateQueries({ queryKey: busKeys.detail(variables.id) });
    },
  });
};

export const useDeleteBus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => busService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: busKeys.lists() });
    },
  });
};
