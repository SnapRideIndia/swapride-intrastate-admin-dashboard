import { z } from "zod";

export const tripFormSchema = z.object({
  driverId: z.string().min(1, "Driver is required"),
  busId: z.string().min(1, "Bus is required"),
  routeId: z.string().min(1, "Route is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

export type TripFormData = z.infer<typeof tripFormSchema>;
