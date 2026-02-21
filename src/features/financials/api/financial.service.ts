import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

export interface Wallet {
  id: string;
  balance: number;
  isActive: boolean;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    profileUrl: string | null;
  };
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: "CREDIT" | "DEBIT" | "REFUND" | "TOPUP";
  status: "SUCCESS" | "PENDING" | "FAILED";
  description: string;
  referenceId: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  wallet?: {
    id: string;
    user: {
      fullName: string;
      email: string;
      profileUrl?: string | null;
    };
  };
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: "WALLET" | "RAZORPAY";
  paymentStatus: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";
  paymentType: "BOOKING" | "TOPUP";
  gatewayOrderId: string | null;
  transactionId: string | null;
  referenceId: string | null;
  bookingId: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    profileUrl: string | null;
    createdAt: string;
  };
  booking?: {
    id: string;
    bookingStatus: string;
    totalAmount: number;
    seats?: {
      id: string;
      seat: {
        id: string;
        seatNumber: string;
        row: number;
        column: number;
      };
    }[];
    route?: {
      id: string;
      routeName: string;
      stops?: {
        id: string;
        sequenceOrder: number;
        point: {
          id: string;
          name: string;
          city: string;
        };
      }[];
    };
  };
}

export interface PaymentAnalytics {
  overview: {
    totalPayments: number;
    totalRevenue: number;
    pendingAmount: number;
    avgTransaction: number;
    successRate: number;
    failureRate: number;
  };
  statusBreakdown: {
    successful: number;
    failed: number;
    pending: number;
  };
  paymentMethods: {
    wallet: {
      count: number;
      percentage: number;
      revenue: number;
    };
    razorpay: {
      count: number;
      percentage: number;
      revenue: number;
    };
  };
  paymentTypes: {
    booking: {
      count: number;
      revenue: number;
    };
    topup: {
      count: number;
      revenue: number;
    };
  };
}

export const financialsApi = {
  // 1. List User Wallets
  getWallets: async (params: {
    search?: string;
    limit?: number;
    offset?: number;
    sortField?: string;
    sortOrder?: string;
  }) => {
    const response = await apiClient.get<{ data: Wallet[]; total: number }>(API_ENDPOINTS.FINANCIALS.WALLETS, {
      params,
    });
    return response.data;
  },

  // 2. Specific Wallet Transactions
  getWalletTransactions: async (
    walletId: string,
    params: { limit?: number; offset?: number; type?: string; startDate?: string; endDate?: string },
  ) => {
    const response = await apiClient.get<{ data: WalletTransaction[]; total: number }>(
      API_ENDPOINTS.FINANCIALS.WALLET_TRANSACTIONS(walletId),
      { params },
    );
    return response.data;
  },

  // 3. Global Wallet Transactions
  getGlobalWalletTransactions: async (params: {
    limit?: number;
    offset?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const response = await apiClient.get<{ data: WalletTransaction[]; total: number }>(
      API_ENDPOINTS.FINANCIALS.GLOBAL_WALLET_TRANSACTIONS,
      { params },
    );
    return response.data;
  },

  getWalletDetails: async (id: string) => {
    const response = await apiClient.get<Wallet & { stats: { totalCredit: number; totalDebit: number } }>(
      API_ENDPOINTS.FINANCIALS.WALLET_DETAILS(id),
    );
    return response.data;
  },

  // 5. Global Payments
  getPayments: async (params: {
    search?: string;
    limit?: number;
    offset?: number;
    status?: string;
    method?: string;
  }) => {
    const response = await apiClient.get<{ data: Payment[]; total: number }>(API_ENDPOINTS.FINANCIALS.PAYMENTS, {
      params,
    });
    return response.data;
  },

  // 6. Payment Details
  getPaymentDetails: async (id: string) => {
    const response = await apiClient.get<Payment>(API_ENDPOINTS.FINANCIALS.PAYMENT_DETAILS(id));
    return response.data;
  },

  // 7. Payment Analytics
  getAnalytics: async () => {
    const response = await apiClient.get<PaymentAnalytics>(API_ENDPOINTS.FINANCIALS.ANALYTICS);
    return response.data;
  },

  // 8. Universal Tracker
  trackId: async (id: string) => {
    const response = await apiClient.get<{ type: "PAYMENT" | "TRANSACTION" | "BOOKING"; data: any }>(
      API_ENDPOINTS.FINANCIALS.TRACK(id),
    );
    return response.data;
  },
};
