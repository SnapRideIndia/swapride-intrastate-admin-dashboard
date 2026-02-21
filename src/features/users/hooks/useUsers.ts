import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../api/user.service";
import { useToast } from "@/hooks/use-toast";

export const USER_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_QUERY_KEYS.all, "list"] as const,
  details: () => [...USER_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
};

/**
 * Hook for fetching all users
 */
export const useUsers = (params?: { limit?: number; offset?: number; search?: string; status?: string }) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.lists(), params || {}],
    queryFn: () => userService.getAll(params),
  });
};

/**
 * Hook for fetching a single user by ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook for managing user status (block/unblock/suspend)
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "block" | "unblock" | "suspend" }) => {
      switch (action) {
        case "block":
          return userService.blockUser(id);
        case "unblock":
          return userService.unblockUser(id);
        case "suspend":
          return userService.suspendUser(id);
        default:
          throw new Error("Invalid action");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast({
        title: "Success",
        description: `User status updated to ${data.status}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });
};
/**
 * Hook for fetching current user profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => userService.getProfile(),
  });
};
