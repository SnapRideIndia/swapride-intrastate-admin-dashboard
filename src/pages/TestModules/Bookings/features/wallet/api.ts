import { testApiClient } from "@/pages/TestModules/shared/test-api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export interface WalletBalance {
  balance: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  source: "WALLET" | "GATEWAY";
  description: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  date: string;
  referenceId?: string;
  balanceBefore?: number;
  balanceAfter?: number;
}

export interface WalletTransactionsResponse {
  data: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface TopupInitiateResponse {
  topUpId: string;
  amount: number;
  gatewayData: {
    orderId: string;
    amount: number;
    currency: string;
    gatewayOrderId: string;
    razorpayOrderId: string;
    razorpayKeyId: string;
  };
}

export interface TransactionDetailResponse {
  id: string;
  source: "WALLET" | "GATEWAY";
  amount: string;
  direction: "CREDIT" | "DEBIT";
  currency: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  paymentMethod?: string;
  gatewayOrderId?: string | null;
  transactionRefId?: string | null;
  balanceBefore?: string | null;
  balanceAfter?: string | null;
  title: string;
  description?: string | null;
  booking?: {
    id: string;
    status: string;
    createdAt: string;
    totalAmount: string;
    pickupName?: string;
    dropName?: string;
  } | null;
}

export const walletApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const response = await testApiClient.get(API_ENDPOINTS.TEST.WALLET.BALANCE);
    return response.data;
  },

  getTransactions: async (
    limit = 20,
    offset = 0,
    options?: {
      filter?: "ALL" | "WALLET" | "GATEWAY";
      datePreset?: string;
      type?: "CREDIT" | "DEBIT";
      search?: string;
    },
  ): Promise<WalletTransactionsResponse> => {
    const params: Record<string, string | number> = { limit, offset };
    params.filter = options?.filter ?? "ALL";
    if (options?.datePreset) params.datePreset = options.datePreset;
    if (options?.type) params.type = options.type;
    if (options?.search?.trim()) params.search = options.search.trim();
    const response = await testApiClient.get(API_ENDPOINTS.TEST.WALLET.FINANCIALS_TRANSACTIONS, {
      params,
    });
    return response.data;
  },

  getTransactionById: async (id: string): Promise<TransactionDetailResponse> => {
    const response = await testApiClient.get(
      `${API_ENDPOINTS.TEST.WALLET.FINANCIALS_TRANSACTIONS}/${id}`,
    );
    return response.data;
  },

  initiateTopup: async (amount: number): Promise<TopupInitiateResponse> => {
    const response = await testApiClient.post(API_ENDPOINTS.TEST.WALLET.TOPUP_INITIATE, { amount });
    return response.data;
  },
};
