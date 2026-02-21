import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../api/notification.service";
import { toast } from "sonner";

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  lists: () => [...NOTIFICATION_QUERY_KEYS.all, "list"] as const,
  list: (params: any) => [...NOTIFICATION_QUERY_KEYS.lists(), params] as const,
  recent: (limit: number) => [...NOTIFICATION_QUERY_KEYS.all, "recent", limit] as const,
  details: () => [...NOTIFICATION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...NOTIFICATION_QUERY_KEYS.details(), id] as const,
  stats: ["notifications", "stats"] as const,
};

export const useNotifications = (params: {
  page: number;
  limit: number;
  q?: string;
  type?: string;
  priority?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => notificationService.getAll(params),
  });
};

export const useRecentNotifications = (limit: number = 5) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.recent(limit),
    queryFn: () => notificationService.getRecent(limit),
    refetchInterval: 30000, // Check for new notifications every 30 seconds
  });
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.detail(id),
    queryFn: () => notificationService.getById(id),
    enabled: !!id,
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.stats,
    queryFn: () => notificationService.getStats(),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      toast.success("Notification broadcasted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send notification");
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      // Optimistic update could go here, but invalidation is safer for now
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      toast.success("Notification deleted");
    },
    onError: () => toast.error("Failed to delete notification"),
  });
};

export const useRegisterDevice = () => {
  return useMutation({
    mutationFn: (data: { fcmToken: string; deviceType: string }) => notificationService.registerDevice(data),
  });
};
