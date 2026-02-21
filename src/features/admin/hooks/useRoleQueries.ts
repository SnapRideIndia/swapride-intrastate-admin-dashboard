import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../api/role.service";
import { Role } from "@/types";

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (params: any) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  permissions: (id: string) => [...roleKeys.detail(id), "permissions"] as const,
  adminCount: (id: string) => [...roleKeys.detail(id), "admin-count"] as const,
};

export const useRoles = (params?: { search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: roleKeys.list(params || {}),
    queryFn: () => roleService.getAll(params),
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  });
};

export const useRolePermissions = (roleId: string) => {
  return useQuery({
    queryKey: roleKeys.permissions(roleId),
    queryFn: () => roleService.getRolePermissions(roleId),
    enabled: !!roleId,
  });
};

export const useAdminCountByRole = (roleId: string) => {
  return useQuery({
    queryKey: roleKeys.adminCount(roleId),
    queryFn: () => roleService.getAdminCountByRole(roleId),
    enabled: !!roleId,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Role> & { permissions?: string[] }) => roleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> & { permissions?: string[] } }) =>
      roleService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.permissions(variables.id) });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};
