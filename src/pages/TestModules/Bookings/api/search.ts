/**
 * Test Module — Booking & Search API
 *
 * All calls here use `testApiClient` which automatically attaches the test
 * user JWT. No need to pass tokens manually.
 */
import { testApiClient } from "../../shared/test-api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import {
  SearchTripsParams,
  SearchResult,
  InitiateBookingDto,
  InitiateRoundTripDto,
  BookingResponse,
  RoundTripBookingResponse,
} from "../types/search";

export const searchApi = {
  /**
   * Search for trips
   */
  searchTrips: async (params: SearchTripsParams, token?: string): Promise<SearchResult[]> => {
    const response = await testApiClient.get(API_ENDPOINTS.TEST.BOOKINGS.SEARCH, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  /**
   * Get seat layout and availability for a trip
   */
  getSeatAvailability: async (tripId: string) => {
    const response = await testApiClient.get(API_ENDPOINTS.TEST.BOOKINGS.GET_SEATS(tripId));
    return response.data;
  },

  /**
   * Get all bookings for the current user
   */
  getMyBookings: async () => {
    const response = await testApiClient.get(API_ENDPOINTS.TEST.BOOKINGS.MY_BOOKINGS);
    return response.data;
  },

  /**
   * Get a booking by its ID
   */
  getBookingById: async (id: string) => {
    const response = await testApiClient.get(API_ENDPOINTS.TEST.BOOKINGS.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Confirm a booking by initiating payment
   */
  confirmPayment: async (id: string, dto: { paymentMethod: string; returnBookingId?: string }) => {
    const response = await testApiClient.post(API_ENDPOINTS.TEST.BOOKINGS.CONFIRM(id), dto);
    return response.data;
  },

  /**
   * Get place autocomplete suggestions
   */
  getPlaceSuggestions: async (input: string, sessionToken?: string) => {
    const response = await testApiClient.get(API_ENDPOINTS.TEST.BOOKINGS.PLACE_AUTOCOMPLETE, {
      params: { input, sessionToken },
    });
    return response.data;
  },

  /**
   * Initiate a single booking
   */
  initiateBooking: async (data: InitiateBookingDto): Promise<BookingResponse> => {
    const response = await testApiClient.post(API_ENDPOINTS.TEST.BOOKINGS.INITIATE, data);
    return response.data;
  },

  /**
   * Initiate a round-trip booking
   */
  initiateRoundTrip: async (data: InitiateRoundTripDto): Promise<RoundTripBookingResponse> => {
    const response = await testApiClient.post(API_ENDPOINTS.TEST.BOOKINGS.INITIATE_ROUND_TRIP, data);
    return response.data;
  },

  /**
   * Change seat for a held booking
   */
  changeSeat: async (bookingId: string, seatNumber: string) => {
    const response = await testApiClient.patch(API_ENDPOINTS.TEST.BOOKINGS.CHANGE_SEAT(bookingId), { seatNumber });
    return response.data;
  },

  /**
   * Confirm booking payment
   */
  confirmBooking: async (bookingId: string, paymentMethod: "WALLET" | "RAZORPAY", returnBookingId?: string) => {
    const response = await testApiClient.post(API_ENDPOINTS.TEST.BOOKINGS.CONFIRM(bookingId), {
      paymentMethod,
      returnBookingId,
    });
    return response.data;
  },
};
