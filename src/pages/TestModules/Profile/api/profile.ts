import { testApiClient } from "../../shared/test-api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { UserProfile, UpdateProfileRequest } from "../types";

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await testApiClient.get(API_ENDPOINTS.TEST.USER.ME);
    return data;
  },

  updateProfile: async (dto: UpdateProfileRequest): Promise<UserProfile> => {
    const formData = new FormData();

    if (dto.fullName) formData.append("fullName", dto.fullName);
    if (dto.email) formData.append("email", dto.email);
    if (dto.gender) formData.append("gender", dto.gender);
    if (dto.dateOfBirth) formData.append("dateOfBirth", dto.dateOfBirth);
    if (dto.bloodGroup) formData.append("bloodGroup", dto.bloodGroup);
    if (dto.profile) formData.append("profile", dto.profile);

    const { data } = await testApiClient.patch(API_ENDPOINTS.TEST.USER.UPDATE_PROFILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const { data } = await testApiClient.delete(API_ENDPOINTS.TEST.USER.DELETE_PROFILE);
    return data;
  },

  getTravelPreferences: async () => {
    const { data } = await testApiClient.get(API_ENDPOINTS.TEST.USER.TRAVEL_PREFERENCES);
    return data;
  },

  updateTravelPreferences: async (type: "home" | "office" | "timings", payload: any) => {
    let endpoint = "";
    if (type === "home") endpoint = API_ENDPOINTS.TEST.USER.UPDATE_HOME;
    else if (type === "office") endpoint = API_ENDPOINTS.TEST.USER.UPDATE_OFFICE;
    else endpoint = API_ENDPOINTS.TEST.USER.UPDATE_TIMINGS;

    const { data } = await testApiClient.patch(endpoint, payload);
    return data;
  },
};
