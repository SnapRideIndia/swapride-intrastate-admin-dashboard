import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { busLayoutService } from "../api/bus-layout.service";
import { useToast } from "@/hooks/use-toast";
import { BusLayout } from "@/types";

export const layoutKeys = {
  all: ["layouts"] as const,
  lists: () => [...layoutKeys.all, "list"] as const,
  details: () => [...layoutKeys.all, "detail"] as const,
  detail: (id: string) => [...layoutKeys.details(), id] as const,
  stats: () => [...layoutKeys.all, "stats"] as const,
};

export const useLayouts = (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  type?: string;
}) => {
  return useQuery({
    queryKey: [...layoutKeys.lists(), params || {}],
    queryFn: () => busLayoutService.getAll(params),
  });
};

export const useActiveLayouts = () => {
  return useQuery({
    queryKey: [...layoutKeys.lists(), "active"],
    queryFn: () => busLayoutService.getActive(),
  });
};

export const useLayout = (id: string) => {
  return useQuery({
    queryKey: layoutKeys.detail(id),
    queryFn: () => busLayoutService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook for fetching layout statistics
 */
export const useLayoutStats = () => {
  return useQuery({
    queryKey: layoutKeys.stats(),
    queryFn: () => busLayoutService.getStats(),
  });
};

/**
 * Hook for duplicating a layout
 */
export const useDuplicateLayout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => busLayoutService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.all });
      toast({
        title: "Success",
        description: "Layout duplicated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate layout",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting a layout
 */
export const useDeleteLayout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await busLayoutService.delete(id);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.all });
      toast({
        title: "Success",
        description: "Layout deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete layout",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for creating a new layout
 */
export const useCreateLayout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => busLayoutService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.all });
      toast({
        title: "Success",
        description: "Layout created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create layout",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating an existing layout
 */
export const useUpdateLayout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BusLayout> }) => busLayoutService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.all });
      queryClient.invalidateQueries({ queryKey: layoutKeys.detail(variables.id) });
      toast({
        title: "Success",
        description: "Layout updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update layout",
        variant: "destructive",
      });
    },
  });
};
