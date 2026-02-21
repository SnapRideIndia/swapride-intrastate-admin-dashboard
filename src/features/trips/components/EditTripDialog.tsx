import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRoutes } from "@/features/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Trip } from "@/types";
import { tripsApi } from "@/features/trips";
import { useDrivers } from "@/features/drivers";
import { useBuses } from "@/features/buses";

const tripFormSchema = z.object({
  driverId: z.string().min(1, "Driver is required"),
  busId: z.string().min(1, "Bus is required"),
  routeId: z.string().min(1, "Route is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type TripFormData = z.infer<typeof tripFormSchema>;

interface EditTripDialogProps {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTripUpdated?: () => void;
}

export function EditTripDialog({ trip, open, onOpenChange, onTripUpdated }: EditTripDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch data from APIs
  const { data: routes = [], isLoading: isRoutesLoading } = useRoutes();
  const { data: driversData, isLoading: isDriversLoading } = useDrivers();
  const { data: busesData, isLoading: isBusesLoading } = useBuses();

  const drivers = driversData?.drivers || [];
  const buses = busesData?.buses || [];

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

  // Pre-fill form when trip changes
  useEffect(() => {
    if (trip && open) {
      // Parse times from ISO strings or "HH:mm AM/PM" format
      // logical handling for time format might be needed if backend sends AM/PM
      // But assuming input type="time" needs "HH:mm" (24h)

      const formatTo24Hour = (timeStr: string) => {
        if (!timeStr) return "";
        // If already HH:mm (24h), return it
        if (/^([01]\d|2[0-3]):?([0-5]\d)$/.test(timeStr)) return timeStr;

        // Handle AM/PM format
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":");
        if (hours === "12") {
          hours = "00";
        }
        if (modifier === "PM") {
          hours = (parseInt(hours, 10) + 12).toString();
        }
        return `${hours.padStart(2, "0")}:${minutes}`;
      };

      form.reset({
        driverId: trip.driverId,
        busId: trip.busId,
        routeId: trip.routeId,
        date: trip.date,
        startTime: formatTo24Hour(trip.scheduledStartTime),
        endTime: formatTo24Hour(trip.scheduledEndTime),
      });
    }
  }, [trip, open, form]);

  const editTripMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      if (!trip) throw new Error("No trip selected");

      // Prechecks: Validate all required data exists
      const route = routes.find((r) => r.id === data.routeId);
      const driver = drivers.find((d) => d.id === data.driverId);
      const bus = buses.find((b) => b.id === data.busId);

      if (!route) throw new Error("Selected route not found");
      if (!driver) throw new Error("Selected driver not found");
      if (!bus) throw new Error("Selected bus not found");

      // Validate times
      const tripDate = data.date; // YYYY-MM-DD format

      // Create Date objects from local time string (browser interprets as local)
      const departureTime = new Date(`${tripDate}T${data.startTime}`);
      const arrivalTime = new Date(`${tripDate}T${data.endTime}`);

      if (isNaN(departureTime.getTime()) || isNaN(arrivalTime.getTime())) {
        throw new Error("Invalid date or time format");
      }

      if (arrivalTime <= departureTime) {
        throw new Error("End time must be after start time");
      }

      const scheduledDepartureAt = departureTime.toISOString();
      const scheduledArrivalAt = arrivalTime.toISOString();

      return tripsApi.edit(trip.id, {
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
        title: "Trip Updated Successfully",
        description: "The trip details have been updated.",
      });
      onOpenChange(false);
      onTripUpdated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Trip",
        description: error.response?.data?.message || error.message || "An error occurred while updating the trip.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TripFormData) => {
    editTripMutation.mutate(data);
  };

  return (
    <>
      <FullPageLoader show={editTripMutation.isPending} label="Updating trip..." />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogDescription>Modify trip details. Only scheduled trips can be edited.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isRoutesLoading || isDriversLoading || isBusesLoading || editTripMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
