import { Notification } from "@/types";
import { PaginatedResponse } from "@/types/pagination";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export type NotificationTargetGroup = "USER" | "USERS" | "DRIVER" | "DRIVERS" | "ADMIN" | "ADMINS" | "ALL";

interface CreateNotificationPayload {
  title: string;
  content: string;
  type?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  targetGroup?: string;
  metadata?: Record<string, unknown>;
  relatedId?: string;
  relatedType?: string;
}

interface SendTestBroadcastPayload {
  title: string;
  content: string;
  targetGroup?: NotificationTargetGroup;
}

const normalizeTargetGroup = (targetGroup?: string): string | undefined => {
  if (!targetGroup) return targetGroup;

  const normalized = targetGroup.toUpperCase().trim();
  const aliasMap: Record<string, string> = {
    USER: "USERS",
    USERS: "USERS",
    DRIVER: "DRIVERS",
    DRIVERS: "DRIVERS",
    ADMIN: "ADMINS",
    ADMINS: "ADMINS",
    ALL: "ALL",
  };

  return aliasMap[normalized] ?? normalized;
};

export const notificationService = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    q?: string;
    type?: string;
    priority?: string;
    status?: string;
  }): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<PaginatedResponse<Notification>>(API_ENDPOINTS.NOTIFICATIONS.BASE, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.GET_BY_ID(id));
    return response.data;
  },

  getRecent: async (limit = 5): Promise<Notification[]> => {
    const { data } = await notificationService.getAll({ page: 1, limit });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    // For now, we fetch latest and count client side or add specific endpoint later
    // Given the backend doesn't have "unread" endpoint yet, let's just return 0 or implement it later.
    // To keep simple for this task:
    return 0;
  },

  create: async (notificationData: CreateNotificationPayload): Promise<Notification> => {
    const payload = {
      ...notificationData,
      targetGroup: normalizeTargetGroup(notificationData.targetGroup),
    };
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.CREATE, payload);
    return response.data;
  },

  sendTestBroadcast: async (data: SendTestBroadcastPayload): Promise<void> => {
    const payload = {
      ...data,
      targetGroup: normalizeTargetGroup(data.targetGroup),
    };
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.TEST_FCM_ALL, payload);
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id));
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  },

  getStats: async (): Promise<{ sentCount: number; openRate: number; criticalAlerts: number }> => {
    const response = await apiClient.get<{ sentCount: number; openRate: number; criticalAlerts: number }>(
      API_ENDPOINTS.NOTIFICATIONS.STATS,
    );
    return response.data;
  },

  registerDevice: async (data: { fcmToken: string; deviceType: string }): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, data);
  },

  uploadMedia: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ url: string }>(API_ENDPOINTS.NOTIFICATIONS.MEDIA_UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
