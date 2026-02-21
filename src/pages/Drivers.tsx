import { useState, useEffect } from "react";
import { Search, Plus, Phone, Star, Users, UserCheck, Route, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { driverApi, useDrivers, useCreateDriver, useDeleteDriver } from "@/features/drivers";
import { StatCard } from "@/features/analytics";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { useToast } from "@/hooks/use-toast";
import { Driver } from "@/types";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTES } from "@/constants/routes";

const driverFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must be less than 50 characters"),
  licenseNumber: z
    .string()
    .min(5, "License number must be at least 5 characters")
    .regex(/^[A-Z0-9-]+$/, "License number must be alphanumeric (uppercase)"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  license: z
    .any()
    .refine((files) => files && files.length > 0, "License document is required")
    .refine((files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024, "Max file size is 5MB")
    .refine(
      (files) => !files || files.length === 0 || ["image/jpeg", "image/png", "image/webp"].includes(files[0].type),
      "Only .jpg, .png, and .webp formats are supported",
    ),
  photo: z
    .any()
    .refine((files) => files && files.length > 0, "Profile photo is required")
    .refine((files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024, "Max file size is 5MB")
    .refine(
      (files) => !files || files.length === 0 || ["image/jpeg", "image/png", "image/webp"].includes(files[0].type),
      "Only .jpg, .png, and .webp formats are supported",
    ),
});

type DriverFormData = z.infer<typeof driverFormSchema>;

const Drivers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: driversData = { drivers: [], total: 0 },
    isLoading: isFetching,
    refetch,
  } = useDrivers({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    search: debouncedSearchQuery,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const drivers = driversData.drivers;
  const totalCount = driversData.total;

  const createMutation = useCreateDriver();
  const deleteMutation = useDeleteDriver();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: "",
      licenseNumber: "",
      mobileNumber: "",
      password: "",
    },
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  const onSubmit = async (data: DriverFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("licenseNumber", data.licenseNumber);
    formData.append("mobileNumber", data.mobileNumber);
    formData.append("password", data.password);
    if (data.license && data.license[0]) {
      formData.append("license", data.license[0]);
    }
    if (data.photo && data.photo[0]) {
      formData.append("photo", data.photo[0]);
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        form.reset();
        setDialogOpen(false);
      },
    });
  };

  const handleViewDriver = (driver: Driver) => {
    navigate(`${ROUTES.DRIVERS}/${driver.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    deleteMutation.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "badge-success";
      case "ON_TRIP":
        return "badge-info";
      case "OFF_DUTY":
        return "badge-warning";
      case "ON_LEAVE":
        return "badge-error";
      case "BLOCKED":
        return "badge-destructive";
      default:
        return "badge-secondary";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <>
      <FullPageLoader show={isFetching && drivers.length === 0} label="Loading drivers..." />
      <FullPageLoader show={createMutation.isPending} label="Adding driver..." />
      <FullPageLoader show={deleteMutation.isPending} label="Deleting driver..." />
      <DashboardLayout>
        <PageHeader
          title="Driver Management"
          subtitle={`Managing ${totalCount} driver${totalCount !== 1 ? "s" : ""}`}
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Driver</DialogTitle>
                  <DialogDescription>
                    Enter the driver details below. Password is required for app login.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Ramesh Kumar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input placeholder="TS-DL-2020-123456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="license"
                        render={({ field: { value: _value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>License Document (Image)</FormLabel>
                            <FormControl>
                              <Input
                                {...fieldProps}
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  onChange(event.target.files);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="photo"
                        render={({ field: { value: _value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>Profile Photo (Image)</FormLabel>
                            <FormControl>
                              <Input
                                {...fieldProps}
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  onChange(event.target.files);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        disabled={createMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        Add Driver
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Drivers" value={totalCount} icon={Users} iconColor="text-primary" vibrant={true} />
          <StatCard
            title="Available"
            value={drivers.filter((d) => d.status === "AVAILABLE").length}
            icon={UserCheck}
            iconColor="text-success"
            vibrant={true}
          />
          <StatCard
            title="On Trip"
            value={drivers.filter((d) => d.status === "ON_TRIP").length}
            icon={Route}
            iconColor="text-info"
            vibrant={true}
          />
          <StatCard
            title="Off Duty"
            value={drivers.filter((d) => d.status === "OFF_DUTY" || d.status === "ON_LEAVE").length}
            icon={UserCog}
            iconColor="text-warning"
            vibrant={true}
          />
        </div>

        <div className="dashboard-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, license or ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="ON_TRIP">On Trip</SelectItem>
                <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="table-container min-h-[400px] relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Assigned Bus</TableHead>
                <TableHead>Trips</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isFetching && drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No drivers found.
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((driver) => {
                  const driverIdShort = driver.id.substring(0, 8).toUpperCase();
                  return (
                    <TableRow
                      key={driver.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => handleViewDriver(driver)}
                    >
                      <TableCell className="font-medium" title={driver.id}>
                        {driverIdShort}...
                      </TableCell>
                      <TableCell>{driver.name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{driver.licenseNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {driver.mobileNumber ? `+91 ${driver.mobileNumber}` : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {driver.assignedBus ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{driver.assignedBus.busNumber}</span>
                            <span className="text-xs text-muted-foreground">{driver.assignedBus.model}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>{driver.totalTrips}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span>{Number(driver.rating || 0).toFixed(1)}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{driver.rating_count || 0} reviews</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusBadge(driver.status)}>{formatStatus(driver.status)}</span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default Drivers;
