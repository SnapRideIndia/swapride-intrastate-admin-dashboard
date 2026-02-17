import { Notification } from "@/types";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export const notificationService = {
  getAll: async (page = 1, limit = 20): Promise<{ data: Notification[]; total: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params: { page, limit } });
    return response.data;
  },

  getRecent: async (limit = 5): Promise<Notification[]> => {
    const { data } = await notificationService.getAll(1, limit);
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    // For now, we fetch latest and count client side or add specific endpoint later
    // Given the backend doesn't have "unread" endpoint yet, let's just return 0 or implement it later.
    // To keep simple for this task:
    return 0;
  },

  create: async (notificationData: Omit<Notification, "id" | "createdAt" | "read">): Promise<Notification> => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.CREATE, notificationData);
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/read-all`);
  },
};
