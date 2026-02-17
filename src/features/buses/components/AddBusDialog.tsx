import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
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
import { useCreateBus } from "../hooks/useBusQueries";
import { useActiveLayouts } from "../hooks/useLayoutQueries";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const busFormSchema = z.object({
  busNumber: z.string().min(1, "Bus number is required"),
  registrationNumber: z
    .string()
    .min(1, "Registration number is required")
    .regex(/^[A-Z]{2}\s\d{2}\s[A-Z]{1,2}\s\d{4}$/, "Format: TS 09 UB 1234"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  seatCapacity: z.coerce.number().min(1, "Minimum 1 seat").max(100, "Maximum 100 seats"),
  fuelType: z.string().min(1, "Fuel type is required"),
  manufactureYear: z.coerce
    .number()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  insuranceExpiry: z.string().min(1, "Insurance expiry date is required"),
  fitnessExpiry: z.string().min(1, "Fitness certificate expiry is required"),
  layoutId: z.string().optional(),
});

type BusFormData = z.infer<typeof busFormSchema>;

interface AddBusDialogProps {
  onBusAdded?: () => void;
}

export function AddBusDialog({ onBusAdded }: AddBusDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createBus, isPending } = useCreateBus();
  const { data: layouts, isLoading: layoutsLoading } = useActiveLayouts();

  const form = useForm<BusFormData>({
    resolver: zodResolver(busFormSchema),
    defaultValues: {
      busNumber: "",
      registrationNumber: "",
      make: "",
      model: "",
      seatCapacity: 40,
      fuelType: "Diesel",
      manufactureYear: new Date().getFullYear(),
      insuranceExpiry: "",
      fitnessExpiry: "",
      layoutId: "none",
    },
  });

  const onSubmit = (data: BusFormData) => {
    // Transform empty strings to undefined for optional fields
    const payload = {
      ...data,
      layoutId: data.layoutId === "none" ? undefined : data.layoutId,
    };

    createBus(payload, {
      onSuccess: () => {
        toast({
          title: "Bus Added Successfully",
          description: `Bus ${data.busNumber} (${data.registrationNumber}) has been added.`,
        });
        form.reset();
        setOpen(false);
        onBusAdded?.();
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Failed to add bus",
          description: error.message || "Something went wrong",
        });
      },
    });
  };

  return (
    <>
      <FullPageLoader show={isPending} label="Adding bus to fleet..." />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Bus
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Bus</DialogTitle>
            <DialogDescription>Enter the details for the new bus to add to your fleet.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="busNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bus Number (Internal ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="BUS-101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="TS 09 UB 1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ashok Leyland">Ashok Leyland</SelectItem>
                          <SelectItem value="Tata">Tata</SelectItem>
                          <SelectItem value="Eicher">Eicher</SelectItem>
                          <SelectItem value="Volvo">Volvo</SelectItem>
                          <SelectItem value="BharatBenz">BharatBenz</SelectItem>
                          <SelectItem value="Force">Force</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Viking BS6 / Magna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="seatCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seating Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="CNG">CNG</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
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
                  name="manufactureYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Manufacture</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="layoutId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Layout (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={layoutsLoading ? "Loading..." : "Assign later"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Assign later</SelectItem>
                          {layouts?.map((layout) => (
                            <SelectItem key={layout.id} value={layout.id}>
                              {layout.name} ({layout.totalSeats} seats)
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
                  name="insuranceExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Expiry</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fitnessExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Expiry</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Bus
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
