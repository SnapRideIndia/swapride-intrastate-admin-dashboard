import { useQuery } from "@tanstack/react-query";
import { financialsApi } from "../api/financial.service";

export const FINANCIAL_QUERY_KEYS = {
  all: ["financials"] as const,
  wallets: () => [...FINANCIAL_QUERY_KEYS.all, "wallets"] as const,
  walletDetails: (id: string) => [...FINANCIAL_QUERY_KEYS.wallets(), id] as const,
  walletTransactions: (walletId: string) => [...FINANCIAL_QUERY_KEYS.walletDetails(walletId), "transactions"] as const,
  globalTransactions: () => [...FINANCIAL_QUERY_KEYS.all, "global-transactions"] as const,
  payments: () => [...FINANCIAL_QUERY_KEYS.all, "payments"] as const,
  paymentDetails: (id: string) => [...FINANCIAL_QUERY_KEYS.payments(), id] as const,
  analytics: () => [...FINANCIAL_QUERY_KEYS.all, "analytics"] as const,
};

export const useWallets = (params: {
  search?: string;
  limit?: number;
  offset?: number;
  sortField?: string;
  sortOrder?: string;
}) => {
  return useQuery({
    queryKey: [...FINANCIAL_QUERY_KEYS.wallets(), params],
    queryFn: () => financialsApi.getWallets(params),
  });
};

export const useWalletDetails = (id: string) => {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.walletDetails(id),
    queryFn: () => financialsApi.getWalletDetails(id),
    enabled: !!id,
  });
};

export const useWalletTransactions = (
  walletId: string,
  params: { limit?: number; offset?: number; type?: string; startDate?: string; endDate?: string },
) => {
  return useQuery({
    queryKey: [...FINANCIAL_QUERY_KEYS.walletTransactions(walletId), params],
    queryFn: () => financialsApi.getWalletTransactions(walletId, params),
    enabled: !!walletId,
  });
};

export const useGlobalWalletTransactions = (params: {
  limit?: number;
  offset?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...FINANCIAL_QUERY_KEYS.globalTransactions(), params],
    queryFn: () => financialsApi.getGlobalWalletTransactions(params),
  });
};

export const usePayments = (params: {
  search?: string;
  limit?: number;
  offset?: number;
  status?: string;
  method?: string;
}) => {
  return useQuery({
    queryKey: [...FINANCIAL_QUERY_KEYS.payments(), params],
    queryFn: () => financialsApi.getPayments(params),
  });
};

export const usePaymentDetails = (id: string) => {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.paymentDetails(id),
    queryFn: () => financialsApi.getPaymentDetails(id),
    enabled: !!id,
  });
};

export const usePaymentAnalytics = () => {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.analytics(),
    queryFn: () => financialsApi.getAnalytics(),
  });
};

export const useTrackPayment = (id: string) => {
  return useQuery({
    queryKey: ["track", id],
    queryFn: () => financialsApi.trackId(id),
    enabled: !!id,
  });
};
