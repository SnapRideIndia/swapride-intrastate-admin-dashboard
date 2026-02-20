import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  MoreVertical,
  Edit,
  Eye,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { AssignTripDialog } from "@/features/trips";
import { EditTripDialog } from "@/features/trips/components/EditTripDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tripsApi } from "@/features/trips/api/trips-api";
import { StatCard } from "@/features/analytics";
import { bookingService } from "@/features/bookings";
import { Trip } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { useDebounce } from "@/hooks/useDebounce";

const Trips = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchParams] = useSearchParams();
  const driverIdFilter = searchParams.get("driverId") || searchParams.get("driverid");

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Map active tab to status and date filters
  const { statusFilter, dateFilter } = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split("T")[0];

    let status = undefined;
    let date = undefined;

    if (activeTab === "today") date = today;
    else if (activeTab === "tomorrow") date = tomorrow;
    else if (activeTab === "day_after") date = dayAfter;
    else if (activeTab === "in_progress") status = "In Progress";
    else if (activeTab === "completed") status = "Completed";

    return { statusFilter: status, dateFilter: date };
  }, [activeTab]);

  // Fetch trips from backend API with server-side pagination and filtering
  const {
    data: tripsData = { data: [], total: 0 },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["trips", currentPage, pageSize, activeTab, debouncedSearch, driverIdFilter],
    queryFn: () =>
      tripsApi.getAll({
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        driverId: driverIdFilter || undefined,
        status: statusFilter,
        date: dateFilter,
        search: debouncedSearch || undefined,
      }),
  });

  const trips = tripsData.data;
  const totalCount = tripsData.total;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const getDelayStatusColor = (tripStatus: Trip["tripStatus"], delayMinutes: number) => {
    if (tripStatus === "On Time" || tripStatus === "Early") return "text-success bg-success/10";
    if (delayMinutes <= 10) return "text-warning bg-warning/10";
    return "text-destructive bg-destructive/10";
  };

  const formatMinutes = (minutes: number): string => {
    const absMinutes = Math.abs(minutes);

    if (absMinutes < 60) {
      return `${absMinutes}m`;
    }

    const days = Math.floor(absMinutes / (24 * 60));
    const hours = Math.floor((absMinutes % (24 * 60)) / 60);
    const mins = absMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);

    return parts.join(" ");
  };

  const getDelayLabel = (tripStatus: Trip["tripStatus"], delayMinutes: number) => {
    if (tripStatus === "On Time") return "On Time";
    if (tripStatus === "Early") return `${formatMinutes(delayMinutes)} early`;
    return `Delayed ${formatMinutes(delayMinutes)}`;
  };

  const viewTripDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setDetailsOpen(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setEditTrip(trip);
    setEditOpen(true);
  };

  const handleCancelTrip = async (id: string) => {
    try {
      if (confirm("Are you sure you want to cancel this trip?")) {
        await tripsApi.updateStatus(id, "CANCELLED");
        refetch();
        toast({ title: "Trip Cancelled", description: "The trip has been cancelled." });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel trip",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTrip = async (id: string) => {
    try {
      if (confirm("Are you sure you want to mark this trip as completed?")) {
        await tripsApi.updateStatus(id, "COMPLETED");
        refetch();
        const updatedTrip = trips.find((t) => t.id === id) || null;
        setSelectedTrip(updatedTrip);
        toast({ title: "Trip Completed", description: "The trip has been marked as completed." });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to complete trip",
        variant: "destructive",
      });
    }
  };

  const handleStartTrip = async (id: string) => {
    try {
      if (confirm("Are you sure you want to start this trip?")) {
        await tripsApi.updateStatus(id, "IN_PROGRESS");
        refetch();
        const updatedTrip = trips.find((t) => t.id === id) || null;
        setSelectedTrip(updatedTrip);
        toast({ title: "Trip Started", description: "The trip has been marked as in progress." });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start trip",
        variant: "destructive",
      });
    }
  };

  // For stats, we might need a separate call or just use the current page's data
  // (Note: This is an approximation since global counts weren't provided in the DTO yet,
  // but we'll stick to your requirement of backend filtering)
  const todayCount = trips.filter((d) => d.date === new Date().toISOString().split("T")[0]).length;
  const inProgressCount = trips.filter((d) => d.status === "In Progress").length;
  const completedCount = trips.filter((d) => d.status === "Completed").length;
  const delayedCount = trips.filter((d) => d.tripStatus === "Delayed").length;

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading trips..." />
      <PageHeader
        title="Trip Management"
        subtitle="Assign and track driver trips"
        actions={<AssignTripDialog onTripAssigned={() => refetch()} />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Trips" value={todayCount} icon={Calendar} iconColor="text-primary" vibrant={true} />
        <StatCard title="In Progress" value={inProgressCount} icon={Clock} iconColor="text-info" vibrant={true} />
        <StatCard title="Completed" value={completedCount} icon={CheckCircle} iconColor="text-success" vibrant={true} />
        <StatCard title="Delayed" value={delayedCount} icon={AlertTriangle} iconColor="text-warning" vibrant={true} />
      </div>

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
              <TabsTrigger value="day_after">Day After</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trip Status</TableHead>
              <TableHead>Passengers</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  No trips found
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip) => (
                <TableRow
                  key={trip.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => viewTripDetails(trip)}
                >
                  <TableCell className="font-medium font-mono text-xs max-w-[120px]">
                    <div className="overflow-hidden whitespace-nowrap group">
                      <div className="group-hover:animate-marquee inline-block">{trip.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{trip.date}</TableCell>
                  <TableCell>{trip.busNumber}</TableCell>
                  <TableCell>{trip.driverName}</TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="overflow-hidden whitespace-nowrap group">
                      <div className="group-hover:animate-marquee inline-block">{trip.routeName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{trip.scheduledStartTime}</TableCell>
                  <TableCell className="text-xs">{trip.scheduledEndTime}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "badge",
                        trip.status === "Completed" && "badge-success",
                        trip.status === "In Progress" && "badge-info",
                        trip.status === "Scheduled" && "badge-warning",
                        trip.status === "Cancelled" && "badge-error",
                      )}
                    >
                      {trip.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getDelayStatusColor(trip.tripStatus, trip.delayMinutes),
                      )}
                    >
                      {getDelayLabel(trip.tripStatus, trip.delayMinutes)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{trip.totalPassengers}</span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewTripDetails(trip)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {(trip.status.toLowerCase() === "scheduled" || trip.status.toLowerCase() === "delayed") && (
                          <>
                            <DropdownMenuItem onClick={() => handleStartTrip(trip.id)}>
                              <Clock className="h-4 w-4 mr-2" />
                              Start Trip
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTrip(trip)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Trip
                            </DropdownMenuItem>
                          </>
                        )}
                        {trip.status.toLowerCase() === "in progress" && (
                          <DropdownMenuItem onClick={() => handleCompleteTrip(trip.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Trip
                          </DropdownMenuItem>
                        )}
                        {trip.status.toLowerCase() !== "completed" && trip.status.toLowerCase() !== "cancelled" && (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleCancelTrip(trip.id)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
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

      {/* Trip Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trip Details - {selectedTrip?.id}</DialogTitle>
            <DialogDescription>Trip information and passenger manifest</DialogDescription>
          </DialogHeader>

          {selectedTrip && (
            <TripDetailsContent
              trip={selectedTrip}
              onClose={() => setDetailsOpen(false)}
              onEdit={() => handleEditTrip(selectedTrip)}
              onStart={() => handleStartTrip(selectedTrip.id)}
              onComplete={() => handleCompleteTrip(selectedTrip.id)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Trip Dialog */}
      <EditTripDialog trip={editTrip} open={editOpen} onOpenChange={setEditOpen} onTripUpdated={() => refetch()} />
    </DashboardLayout>
  );
};

// Extracted for cleaner state management with useQuery
const TripDetailsContent = ({
  trip,
  onClose,
  onEdit,
  onStart,
  onComplete,
}: {
  trip: Trip;
  onClose: () => void;
  onEdit: () => void;
  onStart: () => void;
  onComplete: () => void;
}) => {
  const { data: passengers = [], isLoading: isLoadingPassengers } = useQuery({
    queryKey: ["trip-passengers", trip.id],
    queryFn: () => bookingService.getTripPassengers(trip.id),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const getDelayStatusColor = (tripStatus: Trip["tripStatus"], delayMinutes: number) => {
    if (tripStatus === "On Time" || tripStatus === "Early") return "text-success bg-success/10";
    if (delayMinutes <= 10) return "text-warning bg-warning/10";
    return "text-destructive bg-destructive/10";
  };

  const formatMinutes = (minutes: number): string => {
    const absMinutes = Math.abs(minutes);
    if (absMinutes < 60) return `${absMinutes}m`;
    const days = Math.floor(absMinutes / (24 * 60));
    const hours = Math.floor((absMinutes % (24 * 60)) / 60);
    const mins = absMinutes % 60;
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    return parts.join(" ");
  };

  const getDelayLabel = (tripStatus: Trip["tripStatus"], delayMinutes: number) => {
    if (tripStatus === "On Time") return "On Time";
    if (tripStatus === "Early") return `${formatMinutes(delayMinutes)} early`;
    return `Delayed ${formatMinutes(delayMinutes)}`;
  };

  return (
    <Tabs defaultValue="details">
      <TabsList className="mb-4">
        <TabsTrigger value="details">Trip Details</TabsTrigger>
        <TabsTrigger value="passengers">Passengers ({passengers.length})</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <div className="space-y-4">
          {/* Status Banner */}
          <div
            className={cn(
              "p-4 rounded-lg flex items-center justify-between",
              trip.tripStatus === "On Time" && "bg-success/10 border border-success/20",
              trip.tripStatus === "Delayed" && trip.delayMinutes <= 10 && "bg-warning/10 border border-warning/20",
              trip.tripStatus === "Delayed" &&
                trip.delayMinutes > 10 &&
                "bg-destructive/10 border border-destructive/20",
            )}
          >
            <div className="flex items-center gap-3">
              {trip.tripStatus === "On Time" ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <AlertTriangle
                  className={cn("h-6 w-6", trip.delayMinutes <= 10 ? "text-warning" : "text-destructive")}
                />
              )}
              <div>
                <p className="font-medium">{getDelayLabel(trip.tripStatus, trip.delayMinutes)}</p>
                {trip.delayReason && <p className="text-sm text-muted-foreground">Reason: {trip.delayReason}</p>}
              </div>
            </div>
            <Badge variant={trip.status === "Completed" ? "default" : "secondary"}>{trip.status}</Badge>
          </div>

          {/* Trip Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="text-sm font-medium">{trip.routeName}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium">{trip.date}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Bus</p>
              <p className="text-sm font-medium">{trip.busNumber}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Driver</p>
              <p className="text-sm font-medium">{trip.driverName}</p>
            </div>
          </div>

          {/* Time Comparison */}
          <div className="p-4 rounded-lg border">
            <h4 className="text-sm font-medium mb-3">Time Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Scheduled Start</p>
                <p className="text-sm font-medium">{trip.scheduledStartTime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual Start</p>
                <p className="text-sm font-medium">{trip.actualStartTime || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheduled End</p>
                <p className="text-sm font-medium">{trip.scheduledEndTime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual End</p>
                <p className="text-sm font-medium">{trip.actualEndTime || "-"}</p>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Revenue</span>
              <span className="text-xl font-bold text-primary">₹{trip.revenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          {trip.status.toLowerCase() !== "completed" && trip.status.toLowerCase() !== "cancelled" && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              {(trip.status.toLowerCase() === "scheduled" || trip.status.toLowerCase() === "delayed") && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onClose();
                      onEdit();
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Trip
                  </Button>
                  <Button onClick={onStart}>
                    <Clock className="h-4 w-4 mr-2" />
                    Start Trip
                  </Button>
                </>
              )}
              {trip.status.toLowerCase() === "in progress" && (
                <Button onClick={onComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Trip
                </Button>
              )}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="passengers">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Passenger manifest for this trip</p>
            <Button variant="outline" size="sm">
              Export List
            </Button>
          </div>

          {isLoadingPassengers ? (
            <FullPageLoader show={true} label="Loading passenger manifest..." />
          ) : passengers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No passengers booked for this trip</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seat</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Drop</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Boarding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passengers.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.seats.map((s) => s.seatNumber).join(", ")}</TableCell>
                    <TableCell>{booking.user?.fullName}</TableCell>
                    <TableCell className="text-xs">{booking.user?.mobileNumber}</TableCell>
                    <TableCell className="text-xs">{booking.pickupStop?.name}</TableCell>
                    <TableCell className="text-xs">{booking.dropStop?.name}</TableCell>
                    <TableCell>
                      {booking.paymentId ? (
                        <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded border">
                          {booking.paymentId}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No ID</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "badge",
                          booking.boardingStatus === "BOARDED" && "badge-success",
                          booking.boardingStatus === "NOT_BOARDED" && "badge-warning",
                          booking.boardingStatus === "NO_SHOW" && "badge-error",
                        )}
                      >
                        {booking.boardingStatus}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </TabsContent>
      <TabsContent value="timeline">
        <div className="space-y-4">
          <div className="relative pl-6 border-l-2 border-border space-y-6">
            <div className="relative">
              <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-success border-2 border-background" />
              <p className="text-sm font-medium">Trip Created</p>
              <p className="text-xs text-muted-foreground">{trip.createdAt}</p>
            </div>

            {trip.actualStartTime && (
              <div className="relative">
                <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-info border-2 border-background" />
                <p className="text-sm font-medium">Trip Started</p>
                <p className="text-xs text-muted-foreground">{trip.actualStartTime}</p>
              </div>
            )}

            {trip.tripStatus === "Delayed" && (
              <div className="relative">
                <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-warning border-2 border-background" />
                <p className="text-sm font-medium">Delay Reported</p>
                <p className="text-xs text-muted-foreground">{trip.delayMinutes} minutes delay</p>
                {trip.delayReason && <p className="text-xs text-muted-foreground mt-1">{trip.delayReason}</p>}
              </div>
            )}

            {trip.actualEndTime && (
              <div className="relative">
                <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-success border-2 border-background" />
                <p className="text-sm font-medium">Trip Completed</p>
                <p className="text-xs text-muted-foreground">{trip.actualEndTime}</p>
              </div>
            )}

            {trip.status === "Cancelled" && (
              <div className="relative">
                <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-destructive border-2 border-background" />
                <p className="text-sm font-medium">Trip Cancelled</p>
                <p className="text-xs text-muted-foreground">{trip.notes}</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default Trips;
