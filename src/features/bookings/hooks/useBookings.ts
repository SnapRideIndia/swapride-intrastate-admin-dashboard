import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "../api/booking.service";
import { useToast } from "@/hooks/use-toast";

export const BOOKING_QUERY_KEYS = {
  all: ["bookings"] as const,
  lists: () => [...BOOKING_QUERY_KEYS.all, "list"] as const,
  list: (params: any) => [...BOOKING_QUERY_KEYS.lists(), params] as const,
  details: () => [...BOOKING_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...BOOKING_QUERY_KEYS.details(), id] as const,
  tripPassengers: (tripId: string) => [...BOOKING_QUERY_KEYS.all, "trip-passengers", tripId] as const,
  stats: () => [...BOOKING_QUERY_KEYS.all, "stats"] as const,
};

/**
 * Hook for fetching passengers for a specific trip
 */
export const useTripPassengers = (tripId: string) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.tripPassengers(tripId),
    queryFn: () => bookingService.getTripPassengers(tripId),
    enabled: !!tripId,
  });
};

/**
 * Hook for fetching all bookings
 */
export const useBookings = (params?: {
  userId?: string;
  tripId?: string;
  status?: string;
  boardingStatus?: string;
  date?: string;
  q?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.list(params || {}),
    queryFn: () => bookingService.getAll(params),
  });
};

/**
 * Hook for fetching a single booking by ID
 */
export const useBooking = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.detail(id),
    queryFn: () => bookingService.getById(id),
    enabled: options?.enabled ?? !!id,
  });
};

/**
 * Hook for fetching booking statistics
 */
export const useBookingStats = () => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.stats(),
    queryFn: () => bookingService.getStats(),
  });
};

/**
 * Hook for cancelling a booking
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all });
      toast({ title: "Success", description: "Booking cancelled successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating boarding status
 */
export const useUpdateBoardingStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => bookingService.updateBoardingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all });
      toast({ title: "Success", description: "Boarding status updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update boarding status",
        variant: "destructive",
      });
    },
  });
};
