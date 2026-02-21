import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportService, Ticket } from "../api/support.service";
import { toast } from "sonner";

export const SUPPORT_QUERY_KEYS = {
  all: ["support-tickets"] as const,
  list: (params: any) => [...SUPPORT_QUERY_KEYS.all, "list", params] as const,
  details: () => [...SUPPORT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SUPPORT_QUERY_KEYS.details(), id] as const,
};

export const useSupportTickets = (params: { page: number; limit: number; q?: string; status?: string }) => {
  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.list(params),
    queryFn: () => supportService.getAll(params),
  });
};

export const useSupportTicket = (id: string) => {
  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.detail(id),
    queryFn: () => supportService.getById(id),
    enabled: !!id,
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Ticket["status"] }) => supportService.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.all });
      toast.success(
        `Ticket marked as ${data.status === "in_progress" ? "In Progress" : data.status === "resolved" ? "Resolved" : "Open"}`,
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update ticket status");
    },
  });
};

export const useReplyTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => supportService.reply(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.all });
      toast.success("Reply sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send reply");
    },
  });
};
