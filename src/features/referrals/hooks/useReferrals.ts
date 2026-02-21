import { useQuery } from "@tanstack/react-query";
import { referralService, ReferralsQuery } from "../api/referral.service";

export const referralKeys = {
  all: ["referrals"] as const,
  lists: () => [...referralKeys.all, "list"] as const,
  list: (params: ReferralsQuery) => [...referralKeys.lists(), params] as const,
  stats: () => [...referralKeys.all, "stats"] as const,
};

export const useReferrals = (query?: ReferralsQuery) => {
  return useQuery({
    queryKey: referralKeys.list(query || {}),
    queryFn: () => referralService.getAll(query),
  });
};

export const useReferralStats = () => {
  return useQuery({
    queryKey: referralKeys.stats(),
    queryFn: () => referralService.getStats(),
  });
};
