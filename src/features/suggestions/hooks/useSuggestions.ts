import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suggestionService } from "../api/suggestion.service";
import { SuggestionStatus } from "@/types";

export const suggestionKeys = {
  all: ["suggestions"] as const,
  lists: () => [...suggestionKeys.all, "list"] as const,
  details: () => [...suggestionKeys.all, "detail"] as const,
  detail: (id: string) => [...suggestionKeys.details(), id] as const,
};

export const useSuggestions = (params?: { limit?: number; offset?: number; search?: string; status?: string }) => {
  return useQuery({
    queryKey: [...suggestionKeys.lists(), params || {}],
    queryFn: () => suggestionService.getAll(params),
  });
};

export const useSuggestion = (id: string) => {
  return useQuery({
    queryKey: suggestionKeys.detail(id),
    queryFn: () => suggestionService.getById(id),
    enabled: !!id,
  });
};

export const useUpdateSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: SuggestionStatus; adminNotes?: string } }) =>
      suggestionService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: suggestionKeys.detail(variables.id) });
    },
  });
};

export const useDeleteSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suggestionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.lists() });
    },
  });
};
