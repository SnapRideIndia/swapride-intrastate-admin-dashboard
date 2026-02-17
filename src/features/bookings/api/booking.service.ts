import { Booking } from "@/types";
import { storageService, STORAGE_KEYS } from "@/utils/storage";
import { mockBookings } from "@/api/mock-data";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

const BOOKINGS_KEY = STORAGE_KEYS.BOOKINGS;

const initializeIfEmpty = (): Booking[] => {
  let bookings = storageService.get<Booking[]>(BOOKINGS_KEY);
  if (!bookings || bookings.length === 0) {
    bookings = mockBookings;
    storageService.set(BOOKINGS_KEY, bookings);
  }
  return bookings;
};

export const bookingService = {
  getAll: (): Booking[] => {
    return initializeIfEmpty();
  },

  getById: (id: string): Booking | undefined => {
    const bookings = initializeIfEmpty();
    return bookings.find((booking) => booking.id === id);
  },

  create: (bookingData: Omit<Booking, "id" | "createdAt">): Booking => {
    const bookings = initializeIfEmpty();
    const newBooking: Booking = {
      ...bookingData,
      id: `BKG-${String(bookings.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    };
    bookings.push(newBooking);
    storageService.set(BOOKINGS_KEY, bookings);
    return newBooking;
  },

  update: (id: string, bookingData: Partial<Booking>): Booking | null => {
    const bookings = initializeIfEmpty();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      ...bookingData,
    };
    storageService.set(BOOKINGS_KEY, bookings);
    return bookings[index];
  },

  delete: (id: string): boolean => {
    const bookings = initializeIfEmpty();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) return false;

    bookings.splice(index, 1);
    storageService.set(BOOKINGS_KEY, bookings);
    return true;
  },

  updateBoardingStatus: (id: string, status: Booking["boardingStatus"]): Booking | null => {
    return bookingService.update(id, { boardingStatus: status });
  },

  updatePaymentStatus: (id: string, status: Booking["paymentStatus"]): Booking | null => {
    return bookingService.update(id, { paymentStatus: status });
  },

  getByUser: (userId: string): Booking[] => {
    const bookings = initializeIfEmpty();
    return bookings.filter((booking) => booking.userId === userId);
  },

  getByTrip: (tripId: string): Booking[] => {
    const bookings = initializeIfEmpty();
    return bookings.filter((booking) => booking.tripId === tripId);
  },

  getByDate: (date: string): Booking[] => {
    const bookings = initializeIfEmpty();
    return bookings.filter((booking) => booking.travelDate === date);
  },

  getByRoute: (routeId: string): Booking[] => {
    const bookings = initializeIfEmpty();
    return bookings.filter((booking) => booking.routeId === routeId);
  },

  getTodayBookings: (): Booking[] => {
    const today = new Date().toISOString().split("T")[0];
    return bookingService.getByDate(today);
  },

  getTodayCount: (): number => {
    return bookingService.getTodayBookings().length;
  },

  getTodayRevenue: (): number => {
    const todayBookings = bookingService.getTodayBookings();
    return todayBookings.filter((b) => b.paymentStatus === "Paid").reduce((sum, b) => sum + b.amount, 0);
  },

  getRecentBookings: (limit: number = 10): Booking[] => {
    const bookings = initializeIfEmpty();
    return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  },

  // Trip Passenger List
  getTripPassengers: async (tripId: string): Promise<Booking[]> => {
    try {
      const response = await apiClient.get<Booking[]>(API_ENDPOINTS.TRIPS.GET_PASSENGERS(tripId));
      return response.data;
    } catch (error) {
      console.error("Failed to fetch trip passengers:", error);
      return [];
    }
  },
};
