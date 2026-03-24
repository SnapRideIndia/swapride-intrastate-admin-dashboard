import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rentalApi } from "../api/rental-api";
import { useToast } from "@/hooks/use-toast";
import { RentalStatus } from "../types";

export const RENTAL_QUERY_KEYS = {
  all: ["rentals"] as const,
  lists: () => [...RENTAL_QUERY_KEYS.all, "list"] as const,
  list: (params: any) => [...RENTAL_QUERY_KEYS.lists(), params] as const,
  details: () => [...RENTAL_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...RENTAL_QUERY_KEYS.details(), id] as const,
};

/**
 * Hook for fetching paginated and filtered rental inquiries
 */
export const useRentals = (params: { status?: string; limit?: number; offset?: number; q?: string }) => {
  return useQuery({
    queryKey: RENTAL_QUERY_KEYS.list(params),
    queryFn: () => rentalApi.getAll(params),
  });
};

/**
 * Hook for fetching a single rental inquiry by ID
 */
export const useRental = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: RENTAL_QUERY_KEYS.detail(id),
    queryFn: () => rentalApi.getById(id),
    enabled: options?.enabled ?? !!id,
  });
};

/**
 * Hook for updating a rental inquiry (status and notes)
 */
export const useUpdateRental = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: RentalStatus; notes?: string }) =>
      rentalApi.updateStatus(id, { status, notes }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RENTAL_QUERY_KEYS.all });
      toast({ title: "Success", description: "Rental inquiry updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update rental inquiry",
        variant: "destructive",
      });
    },
  });
};
