import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routeService } from "../api/route.service";
import { Route } from "@/types";

export const routeKeys = {
  all: ["routes"] as const,
  lists: () => [...routeKeys.all, "list"] as const,
  details: () => [...routeKeys.all, "detail"] as const,
  detail: (id: string) => [...routeKeys.details(), id] as const,
  stops: (id: string) => [...routeKeys.detail(id), "stops"] as const,
};

export const pointKeys = {
  all: ["points"] as const,
};

export const usePoints = (params?: { limit?: number; offset?: number; search?: string }) => {
  return useQuery({
    queryKey: [...pointKeys.all, params || {}],
    queryFn: () => routeService.getAllPoints(params),
  });
};

export const useRoutes = (params?: { limit?: number; offset?: number; search?: string; status?: string }) => {
  return useQuery({
    queryKey: [...routeKeys.lists(), params || {}],
    queryFn: () => routeService.getAll(params),
  });
};

export const useRoute = (id: string) => {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: () => routeService.getById(id),
    enabled: !!id,
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Route>) => routeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Route> }) => routeService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: routeKeys.detail(variables.id) });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });
};

export const useSyncRouteMetrics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routeService.syncMetrics(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.detail(variables) });
    },
  });
};

export const useAddStop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, stopData }: { routeId: string; stopData: any }) => routeService.addStop(routeId, stopData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.detail(variables.routeId) });
    },
  });
};

export const useUpdateStop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, stopData }: { stopId: string; stopData: any }) => routeService.updateStop(stopId, stopData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });
};

export const useDeleteStop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId }: { stopId: string }) => routeService.deleteStop(stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });
};

export const useReorderStops = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, orderedStopIds }: { routeId: string; orderedStopIds: string[] }) =>
      routeService.reorderStops(routeId, orderedStopIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.detail(variables.routeId) });
    },
  });
};

// Point Management Mutations
export const useCreatePoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pointData: any) => routeService.createPoint(pointData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.all });
    },
  });
};

export const useUpdatePoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pointData }: { id: string; pointData: any }) => routeService.updatePoint(id, pointData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.all });
    },
  });
};

export const useDeletePoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routeService.deletePoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.all });
    },
  });
};

// Point Image Mutations
export const useAddPointImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pointId, imageData }: { pointId: string; imageData: any }) =>
      routeService.addPointImage(pointId, imageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.all });
    },
  });
};

export const useRemovePointImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pointId, imageId }: { pointId: string; imageId: string }) =>
      routeService.removePointImage(pointId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.all });
    },
  });
};

export const useSetPrimaryPointImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pointId, imageId }: { pointId: string; imageId: string }) =>
      routeService.setPrimaryPointImage(pointId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.all });
    },
  });
};

export const useReorderPointImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pointId, imageOrders }: { pointId: string; imageOrders: { imageId: string; order: number }[] }) =>
      routeService.reorderPointImages(pointId, imageOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.all });
    },
  });
};
