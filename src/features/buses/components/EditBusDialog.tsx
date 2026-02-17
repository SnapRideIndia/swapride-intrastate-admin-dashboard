import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useUpdateBus } from "../hooks/useBusQueries";
import { useActiveLayouts } from "../hooks/useLayoutQueries";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Bus } from "@/types";

const busFormSchema = z.object({
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]),
  registrationNumber: z
    .string()
    .min(1, "Registration number is required")
    .regex(/^[A-Z]{2}\s\d{2}\s[A-Z]{1,2}\s\d{4}$/, "Format: TS 09 UB 1234"),
  seatCapacity: z.coerce.number().min(1, "Minimum 1 seat").max(100, "Maximum 100 seats"),
  insuranceExpiry: z.string().min(1, "Insurance expiry date is required"),
  layoutId: z.string().optional(),
});

type BusFormData = z.infer<typeof busFormSchema>;

interface EditBusDialogProps {
  bus: Bus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBusUpdated?: () => void;
}

export function EditBusDialog({ bus, open, onOpenChange, onBusUpdated }: EditBusDialogProps) {
  const { mutate: updateBus, isPending } = useUpdateBus();
  const { data: layouts, isLoading: layoutsLoading } = useActiveLayouts();

  const form = useForm<BusFormData>({
    resolver: zodResolver(busFormSchema),
    defaultValues: {
      status: "ACTIVE",
      registrationNumber: "",
      seatCapacity: 40,
      insuranceExpiry: "",
      layoutId: "none",
    },
  });

  useEffect(() => {
    if (open && bus) {
      form.reset({
        status: bus.status || "ACTIVE",
        registrationNumber: bus.registrationNumber || "",
        seatCapacity: bus.seatCapacity || 40,
        insuranceExpiry: bus.insuranceExpiry ? new Date(bus.insuranceExpiry).toISOString().split("T")[0] : "",
        layoutId: bus.layoutId || "none",
      });
    }
  }, [open, bus, form]);

  const onSubmit = (data: BusFormData) => {
    if (!bus) return;

    const payload = {
      ...data,
      layoutId: data.layoutId === "none" ? undefined : data.layoutId,
    };

    updateBus(
      { id: bus.id, data: payload },
      {
        onSuccess: () => {
          toast({
            title: "Bus Updated Successfully",
            description: `Bus ${bus.busNumber} has been updated.`,
          });
          onOpenChange(false);
          onBusUpdated?.();
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Failed to update bus",
            description: error.message || "Something went wrong",
          });
        },
      },
    );
  };

  return (
    <>
      <FullPageLoader show={isPending} label="Updating bus details..." />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Edit Bus: {bus?.busNumber}
            </DialogTitle>
            <DialogDescription>Update operational details and status.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bus Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="layoutId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seat Layout</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={layoutsLoading ? "Loading..." : "Assign later"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {layouts?.map((layout) => (
                            <SelectItem key={layout.id} value={layout.id}>
                              {layout.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
