import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "@/hooks/use-toast";
import { useRoutes } from "@/features/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { tripsApi } from "../api/trips-api";
import { driversApi } from "@/features/drivers/api/drivers-api";
import { busesApi } from "@/features/fleet/api/buses-api";

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

export function AssignTripDialog({ onTripAssigned }: AssignTripDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch data from APIs
  const { data: routes = [], isLoading: isRoutesLoading } = useRoutes();
  const { data: drivers = [], isLoading: isDriversLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: driversApi.getAll,
  });
  const { data: buses = [], isLoading: isBusesLoading } = useQuery({
    queryKey: ["buses"],
    queryFn: busesApi.getAll,
  });

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
      // Prechecks: Validate all required data exists
      const route = routes.find((r) => r.id === data.routeId);
      const driver = drivers.find((d) => d.id === data.driverId);
      const bus = buses.find((b) => b.id === data.busId);

      if (!route) {
        throw new Error("Selected route not found");
      }
      if (!driver) {
        throw new Error("Selected driver not found");
      }
      if (!bus) {
        throw new Error("Selected bus not found");
      }

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
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Trip",
        description: error.message || error.response?.data?.message || "An error occurred while creating the trip.",
        variant: "destructive",
      });
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
