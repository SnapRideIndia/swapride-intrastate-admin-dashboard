import { apiClient } from "@/api/api-client";

export interface SendOtpResponse {
  message: string;
  ttl: number;
}

export interface VerifyOtpResponse {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  verificationId?: string;
}

export const authApi = {
  sendOtp: async (mobileNumber: string) => {
    const response = await apiClient.post<SendOtpResponse>("/users/auth/send-otp", {
      mobileNumber,
    });
    return response.data;
  },

  verifyOtp: async (mobileNumber: string, otp: string) => {
    const response = await apiClient.post<VerifyOtpResponse>("/users/auth/verify-otp", {
      mobileNumber,
      otp,
    });
    return response.data;
  },

  register: async (dto: { verificationId: string; email: string; password: string; fullName?: string }) => {
    const response = await apiClient.post("/users/auth/register", dto);
    return response.data;
  },

  login: async (dto: { identifier: string; password: string }) => {
    const response = await apiClient.post("/users/auth/login", dto);
    return response.data;
  },
};