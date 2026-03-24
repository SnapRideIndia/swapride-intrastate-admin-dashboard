import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { PaginatedResponse } from "@/types/pagination";

export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  referrerBonusPaidAt: string | null;
  createdAt: string;
  status: "PENDING" | "COMPLETED";
  rewardAmount: number;
  rewardStatus: "CLAIMED" | "PENDING";
  referrerUser: {
    fullName: string;
    email: string;
    profileUrl?: string | null;
  };
  referredUser: {
    fullName: string;
    email: string;
    profileUrl?: string | null;
  };
}

export interface ReferralStats {
  total: number;
  completed: number;
  pending: number;
  totalRewardValue: number;
}

export interface ReferralsQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}

export const referralService = {
  getAll: async (query?: ReferralsQuery): Promise<PaginatedResponse<Referral>> => {
    const params = {
      limit: query?.limit || 20,
      offset: ((query?.page || 1) - 1) * (query?.limit || 20),
      search: query?.q,
      status: query?.status === "all" ? undefined : query?.status,
    };

    const response = await apiClient.get<PaginatedResponse<Referral>>(
      API_ENDPOINTS.REFERRALS.GET_ALL,
      { params }
    );
    return response.data;
  },

  getStats: async (): Promise<ReferralStats> => {
    const response = await apiClient.get<ReferralStats>(API_ENDPOINTS.REFERRALS.STATS);
    return response.data;
  },
};
