// Mock service for Referrals — replace with real API calls when backend is ready.

export interface Referral {
  id: string;
  referrerName: string;
  referrerEmail: string;
  refereeName: string;
  refereeEmail: string;
  status: "PENDING" | "COMPLETED" | "EXPIRED";
  rewardAmount: number;
  rewardStatus: "CLAIMED" | "UNCLAIMED" | "N/A";
  date: string;
}

export interface ReferralListResponse {
  data: Referral[];
  total: number;
}

export interface ReferralStats {
  total: number;
  completed: number;
  pending: number;
  expired: number;
  totalRewardValue: number;
}

export interface ReferralsQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}

const MOCK_REFERRALS: Referral[] = [
  {
    id: "1",
    referrerName: "Amit Sharma",
    referrerEmail: "amit@example.com",
    refereeName: "Sanjay Gupta",
    refereeEmail: "sanjay@gmail.com",
    status: "COMPLETED",
    rewardAmount: 50,
    rewardStatus: "CLAIMED",
    date: "2026-02-10",
  },
  {
    id: "2",
    referrerName: "Priya Das",
    referrerEmail: "priya@example.com",
    refereeName: "Rahul Verma",
    refereeEmail: "rahul.v@yahoo.com",
    status: "PENDING",
    rewardAmount: 50,
    rewardStatus: "UNCLAIMED",
    date: "2026-02-11",
  },
  {
    id: "3",
    referrerName: "Amit Sharma",
    referrerEmail: "amit@example.com",
    refereeName: "Vikram Singh",
    refereeEmail: "vik@hotmail.com",
    status: "EXPIRED",
    rewardAmount: 0,
    rewardStatus: "N/A",
    date: "2026-02-05",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const referralService = {
  getAll: async (query?: ReferralsQuery): Promise<ReferralListResponse> => {
    await delay(300);
    let filtered = [...MOCK_REFERRALS];

    if (query?.q) {
      const q = query.q.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.referrerName.toLowerCase().includes(q) ||
          r.refereeName.toLowerCase().includes(q) ||
          r.referrerEmail.toLowerCase().includes(q),
      );
    }

    if (query?.status && query.status !== "all") {
      filtered = filtered.filter((r) => r.status === query.status);
    }

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
    };
  },

  getStats: async (): Promise<ReferralStats> => {
    await delay(200);
    return {
      total: MOCK_REFERRALS.length,
      completed: MOCK_REFERRALS.filter((r) => r.status === "COMPLETED").length,
      pending: MOCK_REFERRALS.filter((r) => r.status === "PENDING").length,
      expired: MOCK_REFERRALS.filter((r) => r.status === "EXPIRED").length,
      totalRewardValue: MOCK_REFERRALS.filter((r) => r.rewardStatus === "CLAIMED").reduce(
        (sum, r) => sum + r.rewardAmount,
        0,
      ),
    };
  },
};
