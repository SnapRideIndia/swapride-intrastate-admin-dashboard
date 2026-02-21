import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService, Coupon } from "../api/coupon.service";
import { toast } from "sonner";

export const COUPON_QUERY_KEYS = {
  all: ["coupons"] as const,
  details: () => [...COUPON_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...COUPON_QUERY_KEYS.details(), id] as const,
};

export const useCoupons = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}) => {
  return useQuery({
    queryKey: params ? [...COUPON_QUERY_KEYS.all, params] : COUPON_QUERY_KEYS.all,
    queryFn: () => couponService.getAll(params),
  });
};

export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.detail(id),
    queryFn: () => couponService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: couponService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all });
      toast.success("Coupon created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create coupon");
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => couponService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all });
      toast.success("Coupon updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update coupon");
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: couponService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all });
      toast.success("Coupon deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });
};
