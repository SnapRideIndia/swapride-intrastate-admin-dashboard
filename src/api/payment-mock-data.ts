// Payment-related mock data types based on backend schema

export interface MockPayment {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: "WALLET" | "RAZORPAY";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  gatewayOrderId: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockTransaction {
  id: string;
  userId: string;
  userName: string;
  walletId: string | null;
  bookingId: string | null;
  paymentId: string | null;
  amount: number;
  transactionType: "CREDIT" | "DEBIT" | "BOOKING" | "REFUND" | "TOPUP";
  description: string;
  createdAt: string;
}

export interface MockWallet {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  balance: number;
  isActive: boolean;
  lastTransactionAt: string;
  lastTransactionAmount: number;
  createdAt: string;
}

export interface MockWalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  userName: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REVERSED";
  description: string;
  referenceId: string | null;
  referenceType: "BOOKING" | "REFUND" | "TOPUP" | "WITHDRAWAL" | null;
  createdAt: string;
}

// Generate mock payments
export const generateMockPayments = (count: number = 50): MockPayment[] => {
  const statuses: MockPayment["paymentStatus"][] = ["SUCCESS", "SUCCESS", "SUCCESS", "SUCCESS", "PENDING", "FAILED"];
  const methods: MockPayment["paymentMethod"][] = ["WALLET", "RAZORPAY", "RAZORPAY"];
  const names = [
    "Rajesh Kumar",
    "Priya Sharma",
    "Amit Patel",
    "Sneha Reddy",
    "Vikram Singh",
    "Anjali Desai",
    "Karthik Rao",
    "Neha Gupta",
  ];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const amount = Math.floor(Math.random() * 2000) + 200;
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: `PAY-${String(i + 1).padStart(4, "0")}`,
      bookingId: `BKG-${String(i + 1).padStart(4, "0")}`,
      userId: `USR-${String(Math.floor(i / 3) + 1).padStart(3, "0")}`,
      userName: name,
      userEmail: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      amount,
      paymentMethod: method,
      paymentStatus: status,
      gatewayOrderId: method === "RAZORPAY" ? `order_${Math.random().toString(36).substr(2, 12)}` : null,
      transactionId: status === "SUCCESS" ? `txn_${Math.random().toString(36).substr(2, 12)}` : null,
      createdAt,
      updatedAt: createdAt,
    };
  });
};

// Generate mock transactions
export const generateMockTransactions = (count: number = 50): MockTransaction[] => {
  const types: MockTransaction["transactionType"][] = ["CREDIT", "DEBIT", "BOOKING", "REFUND", "TOPUP"];
  const names = ["Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh", "Anjali Desai"];
  const descriptions = [
    "Wallet top-up via UPI",
    "Booking payment deduction",
    "Booking for Hyderabad → Mumbai",
    "Refund for cancelled booking",
    "Promotional credit",
    "Cashback reward",
  ];

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const amount = Math.floor(Math.random() * 1500) + 100;
    const daysAgo = Math.floor(Math.random() * 30);

    return {
      id: `TXN-${String(i + 1).padStart(4, "0")}`,
      userId: `USR-${String(Math.floor(i / 4) + 1).padStart(3, "0")}`,
      userName: name,
      walletId: type === "CREDIT" || type === "DEBIT" ? `WAL-${String(Math.floor(i / 4) + 1).padStart(3, "0")}` : null,
      bookingId: type === "BOOKING" ? `BKG-${String(i + 1).padStart(4, "0")}` : null,
      paymentId: type === "BOOKING" ? `PAY-${String(i + 1).padStart(4, "0")}` : null,
      amount,
      transactionType: type,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

// Generate mock wallets
export const generateMockWallets = (count: number = 25): MockWallet[] => {
  const names = [
    "Rajesh Kumar",
    "Priya Sharma",
    "Amit Patel",
    "Sneha Reddy",
    "Vikram Singh",
    "Anjali Desai",
    "Karthik Rao",
    "Neha Gupta",
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length];
    const balance = Math.floor(Math.random() * 5000) + 100;
    const daysAgo = Math.floor(Math.random() * 15);
    const lastTxnAmount = Math.floor(Math.random() * 800) + 50;

    return {
      id: `WAL-${String(i + 1).padStart(3, "0")}`,
      userId: `USR-${String(i + 1).padStart(3, "0")}`,
      userName: name,
      userPhone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      balance,
      isActive: Math.random() > 0.1,
      lastTransactionAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      lastTransactionAmount: lastTxnAmount,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

// Generate mock wallet transactions
export const generateMockWalletTransactions = (count: number = 60): MockWalletTransaction[] => {
  const types: MockWalletTransaction["type"][] = ["CREDIT", "DEBIT"];
  const statuses: MockWalletTransaction["status"][] = ["SUCCESS", "SUCCESS", "SUCCESS", "SUCCESS", "PENDING", "FAILED"];
  const refTypes: Array<MockWalletTransaction["referenceType"]> = ["BOOKING", "REFUND", "TOPUP", "WITHDRAWAL", null];
  const names = ["Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh"];
  const descriptions = [
    "Wallet top-up via UPI",
    "Debit for booking BKG-%ID%",
    "Refund for cancelled booking",
    "Promotional credit",
    "Cashback for booking",
    "Withdrawal to bank account",
  ];

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const refType = refTypes[Math.floor(Math.random() * refTypes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const amount = Math.floor(Math.random() * 1200) + 100;
    const balanceBefore = Math.floor(Math.random() * 3000) + 500;
    const balanceAfter = type === "CREDIT" ? balanceBefore + amount : balanceBefore - amount;
    const daysAgo = Math.floor(Math.random() * 45);
    const desc = descriptions[Math.floor(Math.random() * descriptions.length)].replace(
      "%ID%",
      String(i + 1).padStart(4, "0"),
    );

    return {
      id: `WTX-${String(i + 1).padStart(4, "0")}`,
      walletId: `WAL-${String(Math.floor(i / 3) + 1).padStart(3, "0")}`,
      userId: `USR-${String(Math.floor(i / 3) + 1).padStart(3, "0")}`,
      userName: name,
      type,
      amount,
      balanceBefore,
      balanceAfter: status === "SUCCESS" ? balanceAfter : balanceBefore,
      status,
      description: desc,
      referenceId: refType ? `REF-${String(i + 1).padStart(4, "0")}` : null,
      referenceType: refType,
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

// Export generated mock data
export const mockPayments = generateMockPayments(50);
export const mockTransactions = generateMockTransactions(50);
export const mockWallets = generateMockWallets(25);
export const mockWalletTransactions = generateMockWalletTransactions(60);
