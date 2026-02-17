import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useCreateRoute, useUpdateRoute, usePoints } from "../hooks/useRouteQueries";
import { Route } from "@/types";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const routeFormSchema = z
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

type RouteFormData = z.infer<typeof routeFormSchema>;

interface AddRouteDialogProps {
  onRouteAdded?: () => void;
  initialData?: Route | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddRouteDialog({ onRouteAdded, initialData, open: controlledOpen, onOpenChange }: AddRouteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEditing = !!initialData;

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const { data: points = [] } = usePoints();
  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      routeId: "",
      routeFrom: "",
      routeTo: "",
      baseFare: 0,
      status: "ACTIVE",
      startPointId: "",
      endPointId: "",
      distance: "",
      duration: "",
      intermediateStops: [],
    },
  });

  // Handle Init for Edit Mode
  useEffect(() => {
    if (initialData && open) {
      const stops = initialData.stops || [];
      const sorted = [...stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
      const nameParts = initialData.routeName.split(" - ");

      form.reset({
        routeId: initialData.routeId,
        routeFrom: nameParts[0] || "",
        routeTo: nameParts[1] || "",
        baseFare: Number(initialData.baseFare),
        status: initialData.status,
        startPointId: sorted[0]?.pointId || "",
        endPointId: sorted[sorted.length - 1]?.pointId || "",
        intermediateStops: sorted.slice(1, -1).map((s) => s.pointId),
        distance: String(initialData.totalDistance || ""),
        duration: initialData.totalDuration || "",
      });
    } else if (!open) {
      form.reset({
        routeId: "",
        routeFrom: "",
        routeTo: "",
        baseFare: 0,
        status: "ACTIVE",
        startPointId: "",
        endPointId: "",
        distance: "",
        duration: "",
        intermediateStops: [],
      });
    }
  }, [initialData, open, form]);

  // Watch fields for filtering
  const startPointId = form.watch("startPointId");
  const endPointId = form.watch("endPointId");
  const intermediateStops = form.watch("intermediateStops");

  const onSubmit = async (data: RouteFormData) => {
    try {
      const payload = {
        routeId: data.routeId,
        routeName: `${data.routeFrom} - ${data.routeTo}`,
        baseFare: data.baseFare,
        status: data.status,
        startPointId: data.startPointId,
        endPointId: data.endPointId,
        intermediateStops: data.intermediateStops,
      };

      if (isEditing && initialData) {
        await updateRouteMutation.mutateAsync({ id: initialData.id, data: payload as any });
        toast({
          title: "Route Updated",
          description: `Route ${payload.routeId} has been updated successfully.`,
        });
      } else {
        await createRouteMutation.mutateAsync(payload);
        toast({
          title: "Route Added Successfully",
          description: `Route ${payload.routeId} - ${payload.routeName} has been created with all stops.`,
        });
      }

      onRouteAdded?.();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Operation failed. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const isSubmitting = createRouteMutation.isPending || updateRouteMutation.isPending;

  return (
    <>
      <FullPageLoader show={isSubmitting} label={isEditing ? "Updating route..." : "Creating route..."} />
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {controlledOpen === undefined && (
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Route" : "Add New Route"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update route details, stops and pricing."
                : "Create a new bus route with stops and fare details."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="routeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route ID</FormLabel>
                      <FormControl>
                        <Input placeholder="RT-005" {...field} disabled={isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseFare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Fare (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="routeFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route From</FormLabel>
                      <FormControl>
                        <Input placeholder="Origin (e.g. Hyderabad)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="routeTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route To</FormLabel>
                      <FormControl>
                        <Input placeholder="Destination (e.g. Warangal)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startPointId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Point (Point)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select start point" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {points
                            .filter((p: any) => p.id !== endPointId && !intermediateStops.includes(p.id))
                            .map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endPointId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Point (Point)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {points
                            .filter((p: any) => p.id !== startPointId && !intermediateStops.includes(p.id))
                            .map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (Auto-calc)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 150 km" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. Duration (Auto-calc)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2h 30m" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="intermediateStops"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intermediate Stops (Points)</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        const current = field.value || [];
                        if (!current.includes(val)) {
                          field.onChange([...current, val]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Add stops along the route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {points
                          .filter(
                            (p: any) =>
                              p.id !== startPointId && p.id !== endPointId && !intermediateStops.includes(p.id),
                          )
                          .map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((stopId: string) => {
                          const p = points.find((pt: any) => pt.id === stopId);
                          return (
                            <Badge key={stopId} variant="secondary" className="flex items-center gap-1">
                              {p?.name || stopId}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  field.onChange(field.value.filter((id: string) => id !== stopId));
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRouteMutation.isPending || updateRouteMutation.isPending}>
                  {isEditing ? "Save Changes" : "Create Route"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
