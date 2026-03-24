import api from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { RentalRequest, RentalsResponse, RentalStatus } from "../types";

export const rentalApi = {
  getAll: async (params: { status?: string; limit?: number; offset?: number; q?: string }) => {
    const { data } = await api.get<RentalsResponse>(API_ENDPOINTS.RENTALS.GET_ALL, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<RentalRequest>(API_ENDPOINTS.RENTALS.GET_BY_ID(id));
    return data;
  },

  updateStatus: async (id: string, payload: { status: RentalStatus; notes?: string }) => {
    const { data } = await api.patch<RentalRequest>(API_ENDPOINTS.RENTALS.UPDATE(id), payload);
    return data;
  },
};
