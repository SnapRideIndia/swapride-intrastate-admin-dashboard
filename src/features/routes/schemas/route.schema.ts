import { z } from "zod";

export const routeFormSchema = z
  .object({
    routeId: z.string().min(1, "Route ID is required"),
    routeFrom: z.string().min(1, "Starting location is required"),
    routeTo: z.string().min(1, "Ending location is required"),
    baseFare: z.coerce.number().min(0, "Fare must be at least ₹0"),
    status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]),
    startPointId: z.string().min(1, "Start point is required"),
    endPointId: z.string().min(1, "Destination point is required"),
    distance: z.string().optional(),
    duration: z.string().optional(),
    intermediateStops: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.startPointId === data.endPointId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start and Destination points cannot be the same",
        path: ["endPointId"],
      });
    }

    if (data.intermediateStops.includes(data.startPointId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Intermediate stops cannot include the starting point",
        path: ["intermediateStops"],
      });
    }

    if (data.intermediateStops.includes(data.endPointId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Intermediate stops cannot include the destination point",
        path: ["intermediateStops"],
      });
    }
  });

export type RouteFormData = z.infer<typeof routeFormSchema>;
