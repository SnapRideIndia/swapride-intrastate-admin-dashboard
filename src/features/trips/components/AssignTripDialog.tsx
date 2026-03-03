import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { useRoutes } from "@/features/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { tripsApi } from "@/features/trips";
import { useDrivers } from "@/features/drivers";
import { useBuses } from "@/features/buses";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const tripFormSchema = z.object({
  driverId: z.string().min(1, "Driver is required"),
  busId: z.string().min(1, "Bus is required"),
  routeId: z.string().min(1, "Route is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type TripFormData = z.infer<typeof tripFormSchema>;

interface AssignTripDialogProps {
  onTripAssigned?: (trip: TripFormData) => void;
}

/** Extract the most specific error message from an API error */
function extractErrorMessage(error: any): string {
  // Array of messages from backend (e.g. validation errors)
  const messages = error?.response?.data?.message;
  if (Array.isArray(messages) && messages.length > 0) return messages.join(", ");
  if (typeof messages === "string" && messages) return messages;
  // Single string fallback
  if (error?.response?.data?.error) return error.response.data.error;
  // Client-side thrown error (no response = not an axios HTTP error)
  if (error?.message && !error.response) return error.message;
  return "An unexpected error occurred. Please try again.";
}

export function AssignTripDialog({ onTripAssigned }: AssignTripDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch data from APIs
  const { data: routesData, isLoading: isRoutesLoading } = useRoutes();
  const { data: driversData, isLoading: isDriversLoading } = useDrivers();
  const { data: busesData, isLoading: isBusesLoading } = useBuses();

  const routes = routesData?.data || [];
  const drivers = driversData?.data || [];
  const buses = busesData?.data || [];

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      driverId: "",
      busId: "",
      routeId: "",
      date: "",
      startTime: "",
      endTime: "",
    },
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      setFormError(null);
      // Prechecks: Validate all required data exists
      const route = routes.find((r) => r.id === data.routeId);
      const driver = drivers.find((d) => d.id === data.driverId);
      const bus = buses.find((b) => b.id === data.busId);

      if (!route) throw new Error("Selected route not found");
      if (!driver) throw new Error("Selected driver not found");
      if (!bus) throw new Error("Selected bus not found");

      // Validate times
      const tripDate = data.date; // YYYY-MM-DD format
      const scheduledDepartureAt = `${tripDate}T${data.startTime}:00Z`;
      const scheduledArrivalAt = `${tripDate}T${data.endTime}:00Z`;

      const departureTime = new Date(scheduledDepartureAt);
      const arrivalTime = new Date(scheduledArrivalAt);

      if (arrivalTime <= departureTime) {
        throw new Error("End time must be after start time");
      }

      return tripsApi.create({
        tripDate,
        routeId: data.routeId,
        busId: data.busId,
        driverId: data.driverId,
        scheduledDepartureAt,
        scheduledArrivalAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({
        title: "Trip Created Successfully",
        description: "The trip has been assigned and scheduled.",
      });
      setFormError(null);
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      setFormError(extractErrorMessage(error));
    },
  });

  const onSubmit = (data: TripFormData) => {
    createTripMutation.mutate(data);
    onTripAssigned?.(data);
  };

  return (
    <>
      <FullPageLoader show={createTripMutation.isPending} label="Creating trip..." />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Assign Trip
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Trip</DialogTitle>
            <DialogDescription>Assign a driver to a bus and route for a specific trip.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Inline error alert – shown for API errors (e.g. scheduling conflict) */}
              {formError && (
                <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Could not create trip</p>
                    <p className="mt-0.5 text-destructive/80">{formError}</p>
                  </div>
                </div>
              )}
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isDriversLoading ? (
                          <div className="p-2 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ) : (
                          drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="busId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bus</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isBusesLoading ? (
                          <div className="p-2 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ) : (
                          buses.map((bus) => (
                            <SelectItem key={bus.id} value={bus.id}>
                              {bus.busNumber} {bus.make && bus.model ? `(${bus.make} ${bus.model})` : ""}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="routeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isRoutesLoading ? (
                          <div className="p-2 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ) : (
                          routes.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.routeName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" min={new Date().toISOString().split("T")[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isRoutesLoading || isDriversLoading || isBusesLoading || createTripMutation.isPending}
                >
                  Assign Trip
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
