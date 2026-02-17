import { useQuery } from "@tanstack/react-query";
import { busLayoutService } from "../api/bus-layout.service";

export const layoutKeys = {
  all: ["layouts"] as const,
  lists: () => [...layoutKeys.all, "list"] as const,
  details: () => [...layoutKeys.all, "detail"] as const,
  detail: (id: string) => [...layoutKeys.details(), id] as const,
};

export const useLayouts = () => {
  return useQuery({
    queryKey: layoutKeys.lists(),
    queryFn: () => busLayoutService.getAll(),
  });
};

export const useActiveLayouts = () => {
  return useQuery({
    queryKey: [...layoutKeys.lists(), "active"],
    queryFn: () => busLayoutService.getActive(),
  });
};

export const useLayout = (id: string) => {
  return useQuery({
    queryKey: layoutKeys.detail(id),
    queryFn: () => busLayoutService.getById(id),
    enabled: !!id,
  });
};
