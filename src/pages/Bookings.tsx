import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  MoreVertical,
  Calendar as CalendarIcon,
  Ticket,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  RotateCcw,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useBookings,
  useBookingStats,
  useCancelBooking,
  BookingStatusBadge,
  BoardingStatusBadge,
} from "@/features/bookings";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Booking } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/useDebounce";

export default function Bookings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const search = searchParams.get("q") || "";
  const debouncedSearch = useDebounce(search, 500);
  const statusFilter = searchParams.get("status") || "all";
  const boardingFilter = searchParams.get("boarding") || "all";
  const dateFilter = searchParams.get("date") || "all";

  // Fetch Bookings using Custom Hook
  const {
    data: bookingsData = { data: [], total: 0 },
    isLoading: isBookingsLoading,
    refetch,
  } = useBookings({
    status: statusFilter === "all" ? undefined : statusFilter,
    boardingStatus: boardingFilter === "all" ? undefined : boardingFilter,
    date: dateFilter === "all" ? undefined : dateFilter,
    q: debouncedSearch || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const bookings = bookingsData.data;
  const totalCount = bookingsData.total;

  // Fetch Stats using Custom Hook
  const { data: statsData } = useBookingStats();

  const stats = statsData || {
    totalBookings: 0,
    todayBookings: 0,
    todayRevenue: 0,
    pendingConfirmations: 0,
  };

  // Cancel Booking Mutation
  const cancelMutation = useCancelBooking();

  // No longer need manual useEffect for fetching

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, boardingFilter, dateFilter]);

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this booking? This may initiate a refund.")) {
      cancelMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isBookingsLoading} label="Loading dispatch records..." />
      <FullPageLoader show={cancelMutation.isPending} label="Cancelling booking..." />
      <div className="space-y-6">
        <PageHeader
          title="Bookings & Dispatch"
          subtitle="Manage passenger reservations, monitor boarding, and handle cancellations."
          actions={
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="border-border/60 rounded-full h-10 w-10 shadow-sm transition-transform active:rotate-180"
              title="Refresh Data"
            >
              <RotateCcw className="h-4 w-4 text-slate-600" />
            </Button>
          }
        />

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="dashboard-card border-none bg-blue-50/50 shadow-sm border-l-4 border-blue-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Today's Bookings</p>
                <p className="text-2xl font-bold text-blue-900">{stats.todayBookings}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-none bg-green-50/50 shadow-sm border-l-4 border-green-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">₹{stats.todayRevenue.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-none bg-amber-50/50 shadow-sm border-l-4 border-amber-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Pending Holds</p>
                <p className="text-2xl font-bold text-amber-900">{stats.pendingConfirmations}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-none bg-indigo-50/50 shadow-sm border-l-4 border-indigo-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.totalBookings}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Filter className="h-5 w-5 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="dashboard-card p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm border-border/60 rounded-xl">
          <Tabs
            value={statusFilter}
            onValueChange={(val) => updateFilters({ status: val })}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-[300px] h-10 bg-muted/20 border border-border/40">
              <TabsTrigger value="all" className="text-[10px] font-bold tracking-tighter">
                ALL
              </TabsTrigger>
              <TabsTrigger
                value="confirmed"
                className="text-[10px] font-bold tracking-tighter uppercase text-emerald-600"
              >
                Paid
              </TabsTrigger>
              <TabsTrigger value="held" className="text-[10px] font-bold tracking-tighter uppercase text-amber-600">
                Hold
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-[10px] font-bold tracking-tighter uppercase text-rose-600">
                Void
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex shrink-0 bg-muted/20 p-1 rounded-lg border border-border/40 gap-1 h-10 items-center min-w-fit">
            <Button
              variant={dateFilter === "all" ? "secondary" : "ghost"}
              className="h-8 text-[10px] font-bold px-3"
              onClick={() => updateFilters({ date: "all" })}
            >
              ALL TIME
            </Button>
            <Button
              variant={dateFilter === "today" ? "secondary" : "ghost"}
              className="h-8 text-[10px] font-bold px-3"
              onClick={() => updateFilters({ date: "today" })}
            >
              TODAY
            </Button>
            <Button
              variant={dateFilter === "yesterday" ? "secondary" : "ghost"}
              className="h-8 text-[10px] font-bold px-3"
              onClick={() => updateFilters({ date: "yesterday" })}
            >
              YESTERDAY
            </Button>
            <Input
              type="date"
              className="h-8 w-36 text-[10px] border-none bg-transparent focus-visible:ring-0 pr-0"
              value={dateFilter.includes("-") ? dateFilter : ""}
              onChange={(e) => updateFilters({ date: e.target.value })}
            />
          </div>

          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by passenger, mobile, ID or payment..."
              className="pl-10 h-10 border-border/60 rounded-lg bg-background/50 shadow-none focus-visible:ring-1"
              value={search}
              onChange={(e) => updateFilters({ q: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Select value={boardingFilter} onValueChange={(val) => updateFilters({ boarding: val })}>
              <SelectTrigger className="w-[160px] h-10 border-border/60 rounded-lg shadow-none">
                <SelectValue placeholder="Boarding Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Boarding</SelectItem>
                <SelectItem value="boarded">Boarded</SelectItem>
                <SelectItem value="not_boarded">Not Boarded</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>

            {(search || statusFilter !== "all" || boardingFilter !== "all") && (
              <Button
                variant="ghost"
                className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Reset
              </Button>
            )}
          </div>
        </Card>

        {/* Bookings Table */}
        <div className="table-container rounded-xl shadow-sm border-border/40 overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[150px]">Booking ID</TableHead>
                <TableHead>Passenger</TableHead>
                <TableHead>Journey</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Boarding</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Booked On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 && !isBookingsLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No matching bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow
                    key={b.id}
                    className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => navigate(ROUTES.BOOKING_DETAILS.replace(":id", b.id))}
                  >
                    <TableCell className="font-mono text-xs font-bold text-slate-500">
                      {b.id.split("-")[0]}...
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{b.user?.fullName || "Guest"}</span>
                        <span className="text-xs text-slate-500">{b.user?.mobileNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-medium text-slate-600 truncate max-w-[120px]">
                            {b.pickupStop?.name || "Start"}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span className="font-medium text-slate-600 truncate max-w-[120px]">
                            {b.dropStop?.name || "End"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <Ticket className="h-3 w-3" /> {b.seats?.length || 0} Seat(s) • {b.trip?.routeName || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">₹{Number(b.totalAmount).toLocaleString()}</span>
                        {Number(b.discountAmount) > 0 && (
                          <span className="text-[10px] text-emerald-600">Saved ₹{b.discountAmount}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={b.bookingStatus} />
                    </TableCell>
                    <TableCell>
                      <BoardingStatusBadge status={b.boardingStatus} />
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
                        {b.paymentId || "UNPAID"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-slate-500">
                        <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                        <span>
                          {new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(ROUTES.BOOKING_DETAILS.replace(":id", b.id))}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          {b.bookingStatus === "CONFIRMED" && (
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(b.id);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Cancel & Refund
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
      </div>
    </DashboardLayout>
  );
}
