import api from "./api-client";
import { API_ENDPOINTS } from "./endpoints";

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
  getCoupons: async () => {
    const response = await api.get<Coupon[]>(API_ENDPOINTS.COUPONS.GET_ALL);
    return response.data;
  },

  getCouponById: async (id: string) => {
    const response = await api.get<Coupon>(API_ENDPOINTS.COUPONS.GET_BY_ID(id));
    return response.data;
  },

  createCoupon: async (data: Partial<Coupon> & { targetRouteIds?: string[] }) => {
    const response = await api.post<Coupon>(API_ENDPOINTS.COUPONS.CREATE, data);
    return response.data;
  },

  updateCoupon: async (id: string, data: Partial<Coupon> & { targetRouteIds?: string[] }) => {
    const response = await api.patch<Coupon>(API_ENDPOINTS.COUPONS.UPDATE(id), data);
    return response.data;
  },

  deleteCoupon: async (id: string) => {
    const response = await api.delete(API_ENDPOINTS.COUPONS.DELETE(id));
    return response.data;
  },
};
