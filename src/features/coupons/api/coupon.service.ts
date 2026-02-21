import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT" | "FIXED_PRICE";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit: number;
  usedCount: number;
  isActive: boolean;
  isPublic: boolean;
  isAutoApply: boolean;
  minRideCount?: number;
  maxRideCount?: number;
  targetRoutes?: Array<{ routeId: string }>;
}

export const couponService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }): Promise<{ data: Coupon[]; total: number }> => {
    const { data } = await apiClient.get<{ data: Coupon[]; total: number }>(API_ENDPOINTS.COUPONS.GET_ALL, { params });
    return data;
  },

  getById: async (id: string): Promise<Coupon> => {
    const { data } = await apiClient.get<Coupon>(API_ENDPOINTS.COUPONS.GET_BY_ID(id));
    return data;
  },

  create: async (data: Partial<Coupon> & { targetRouteIds?: string[] }): Promise<Coupon> => {
    const { data: response } = await apiClient.post<Coupon>(API_ENDPOINTS.COUPONS.CREATE, data);
    return response;
  },

  update: async (id: string, data: Partial<Coupon> & { targetRouteIds?: string[] }): Promise<Coupon> => {
    const { data: response } = await apiClient.patch<Coupon>(API_ENDPOINTS.COUPONS.UPDATE(id), data);
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.COUPONS.DELETE(id));
  },
};
