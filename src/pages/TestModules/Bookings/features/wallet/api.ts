import axios from "axios";
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

const getHeaders = () => {
  const token = localStorage.getItem("test_user_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const walletApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const response = await axios.get(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.TEST.WALLET.BALANCE}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getTransactions: async (limit = 20, offset = 0): Promise<WalletTransactionsResponse> => {
    const response = await axios.get(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.TEST.WALLET.FINANCIALS_TRANSACTIONS}`, {
      params: { limit, offset, filter: "ALL" },
      headers: getHeaders(),
    });
    return response.data;
  },

  initiateTopup: async (amount: number): Promise<TopupInitiateResponse> => {
    const response = await axios.post(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.TEST.WALLET.TOPUP_INITIATE}`,
      { amount },
      { headers: getHeaders() },
    );
    return response.data;
  },
};
