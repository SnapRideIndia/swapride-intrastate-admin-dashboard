import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, MoreVertical, Edit, Trash2, Eye, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddBusDialog, BusLayoutDialog, EditBusDialog, busService, useBuses, useDeleteBus } from "@/features/buses";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Bus } from "@/types";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";

const Buses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [pageSize, setPageSize] = useState(20);

  const setSearchQuery = (q: string) => {
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q);
    else params.delete("q");
    params.set("page", "1");
    setSearchParams(params);
  };

  const setStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== "all") params.set("status", status);
    else params.delete("status");
    params.set("page", "1");
    setSearchParams(params);
  };

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data: busesData,
    isLoading,
    error,
    refetch,
  } = useBuses({
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  });

  const { mutate: deleteBus } = useDeleteBus();
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const buses = busesData?.buses || [];
  const totalCount = busesData?.total || 0;

  const viewBusDetails = (bus: Bus) => {
    setSelectedBus(bus);
    setDetailsOpen(true);
  };

  const handleEditBus = (bus: Bus) => {
    setSelectedBus(bus);
    setEditOpen(true);
  };

  const handleDeleteBus = (id: string) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      deleteBus(id, {
        onSuccess: () => {
          toast({ title: "Bus Deleted", description: "Bus has been removed successfully." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err.message });
        },
      });
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-semibold">Failed to load buses</h2>
          <p className="mt-1">{(error as any).message}</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading fleet data..." />

      <PageHeader
        title="Bus Management"
        subtitle={`Manage your fleet of ${totalCount} buses`}
        actions={<AddBusDialog onBusAdded={() => refetch()} />}
      />

      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by bus number, registration, or model..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "maintenance" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("maintenance")}
            >
              Maintenance
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </Button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bus Number</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Route</TableHead>
              <TableHead>Layout</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && buses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted rounded-full p-6 mb-4">
                      <Search className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No buses found</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                      We couldn't find any buses matching your current search or filters. Try adjusting your search term
                      or status selection.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              buses.map((bus) => (
                <TableRow key={bus.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewBusDetails(bus)}>
                  <TableCell className="font-medium">{bus.busNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{bus.model || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{bus.manufactureYear || "N/A"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{bus.registrationNumber || "N/A"}</TableCell>
                  <TableCell>{bus.seatCapacity || "N/A"} seats</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "badge",
                        bus.status === "ACTIVE" && "badge-success",
                        bus.status === "MAINTENANCE" && "badge-warning",
                        bus.status === "INACTIVE" && "badge-error",
                      )}
                    >
                      {bus.status}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{bus.currentRoute || "Unassigned"}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {bus.layoutId ? (
                      <BusLayoutDialog bus={bus} triggerText="View" />
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No Layout</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewBusDetails(bus)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBus(bus);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBus(bus.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBus?.busNumber} - {selectedBus?.model || "N/A"}
            </DialogTitle>
            <DialogDescription>Bus details and performance analytics</DialogDescription>
          </DialogHeader>

          {selectedBus && (
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                {selectedBus.status !== "INACTIVE" && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
                <TabsTrigger value="maintenance">Condition</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Vehicle Identification
                      </p>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold">{selectedBus.busNumber}</span>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          Internal ID
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1">{selectedBus.registrationNumber || "N/A"}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Make / Model</p>
                      <p className="text-sm font-semibold">
                        {selectedBus.make || "N/A"} {selectedBus.model || ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedBus.manufactureYear ? `Year: ${selectedBus.manufactureYear}` : "Year: N/A"}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Specifications</p>
                      <div className="flex gap-2 items-center">
                        <span className="text-sm font-semibold">{selectedBus.seatCapacity || "N/A"} Seats</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-sm font-medium">{selectedBus.fuelType || "N/A"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Status: {selectedBus.status}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Operations</p>
                      <p className="text-sm font-semibold truncate">{selectedBus.currentRoute || "Unassigned"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Layout: {selectedBus.layout?.name || "None Assigned"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {selectedBus.status !== "INACTIVE" && (
                <TabsContent value="analytics">
                  <AnalyticsSection busId={selectedBus.id} />
                </TabsContent>
              )}

              <TabsContent value="maintenance">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fitness Certificate</p>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          selectedBus.fitnessExpiry &&
                            new Date(selectedBus.fitnessExpiry) < new Date() &&
                            "text-destructive",
                        )}
                      >
                        {selectedBus.fitnessExpiry || "N/A"}
                      </p>
                      {selectedBus.fitnessExpiry && new Date(selectedBus.fitnessExpiry) < new Date() && (
                        <p className="text-[10px] text-destructive font-medium mt-1">Expired</p>
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Insurance Policy</p>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          selectedBus.insuranceExpiry &&
                            new Date(selectedBus.insuranceExpiry) < new Date() &&
                            "text-destructive",
                        )}
                      >
                        {selectedBus.insuranceExpiry || "N/A"}
                      </p>
                      {selectedBus.insuranceExpiry && new Date(selectedBus.insuranceExpiry) < new Date() && (
                        <p className="text-[10px] text-destructive font-medium mt-1">Expired</p>
                      )}
                    </div>
                  </div>
                  <div className="p-6 rounded-lg border border-dashed border-border flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 text-muted-foreground/20 mb-2" />
                    <h4 className="text-sm font-medium">Condition History</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      No maintenance or inspection logs available for this vehicle.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <EditBusDialog bus={selectedBus} open={editOpen} onOpenChange={setEditOpen} onBusUpdated={() => refetch()} />
    </DashboardLayout>
  );
};

const AnalyticsSection = ({ busId }: { busId: string }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    busService.getBusAnalytics(busId).then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, [busId]);

  if (loading) return <FullPageLoader show={true} label="Loading stats..." />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
          <p className="text-xl font-bold text-primary">₹{analytics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <p className="text-xs text-muted-foreground mb-1">Total Bookings</p>
          <p className="text-xl font-bold text-success">{analytics.totalBookings.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-info/10 border border-info/20">
          <p className="text-xs text-muted-foreground mb-1">Occupancy Rate</p>
          <p className="text-xl font-bold text-info">{analytics.occupancyRate}%</p>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-xs text-muted-foreground mb-1">Daily Utilization</p>
          <p className="text-xl font-bold text-warning">{analytics.dailyUtilization}%</p>
        </div>
      </div>
    </div>
  );
};

export default Buses;
