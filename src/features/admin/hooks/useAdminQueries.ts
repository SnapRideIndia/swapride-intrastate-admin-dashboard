import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../api/admin.service";

export const adminKeys = {
  all: ["admins"] as const,
  lists: () => [...adminKeys.all, "list"] as const,
  list: (filters: string) => [...adminKeys.lists(), { filters }] as const,
  details: () => [...adminKeys.all, "detail"] as const,
  detail: (id: string) => [...adminKeys.details(), id] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
};

export const useAdmins = () => {
  return useQuery({
    queryKey: adminKeys.lists(),
    queryFn: () => adminService.getAll(),
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getStats(),
  });
};

export const useAdmin = (id: string) => {
  return useQuery({
    queryKey: adminKeys.detail(id),
    queryFn: () => adminService.getById(id),
    enabled: !!id,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; fullName?: string; password: string; roleId?: string }) =>
      adminService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ roleId?: string; fullName?: string }> }) =>
      adminService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.detail(variables.id) });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
};

export const useSuspendAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
    },
  });
};

export const useActivateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
    },
  });
};
