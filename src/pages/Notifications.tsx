import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import {
  Search,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Bell,
  AlertTriangle,
  MessageSquare,
  Send,
  Check,
  Eye,
  User,
  CreditCard,
  MapPin,
  Megaphone,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  useNotifications,
  useNotificationStats,
  useMarkAsRead,
  useDeleteNotification,
} from "@/features/notifications/hooks/useNotifications";
import { AccessDenied } from "@/components/AccessDenied";
import { useApiError } from "@/hooks/useApiError";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/permissions";


export default function Notifications() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = usePermissions();

  const search = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type") || "all";
  const priorityFilter = searchParams.get("priority") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;

  const debouncedSearch = useDebounce(search, 500);

  const updateFilters = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "" || (key === "page" && value === 1)) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    if (!updates.page) {
      newParams.delete("page");
    }

    setSearchParams(newParams, { replace: true });
  };

  const { data: notificationsData, isLoading: loadingNotifications, error } = useNotifications({
    page: currentPage,
    limit: pageSize,
    q: debouncedSearch,
    type: typeFilter !== "all" ? typeFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { isAccessDenied } = useApiError(error);

  const { data: statsData } = useNotificationStats();

  const markAsReadMutation = useMarkAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = notificationsData?.data || [];
  const totalCount = notificationsData?.pagination?.total || 0;
  const stats = statsData || { sentCount: 0, openRate: 0, criticalAlerts: 0 };

  const loading = loadingNotifications;

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this notification history?")) {
      deleteMutation.mutate(id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TRIP_UPDATE":
      case "trip_assignment":
        return <MapPin className="h-4 w-4 text-emerald-500" />;
      case "PAYMENT_SUCCESS":
      case "payment_issue":
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "TICKET_REPLY":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "SYSTEM_ALERT":
      case "system_alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "PROMOTIONAL":
      case "marketing":
        return <Megaphone className="h-4 w-4 text-orange-500" />;
      case "driver_request":
        return <User className="h-4 w-4 text-indigo-500" />;
      case "RENTAL_REQUEST":
        return <Bell className="h-4 w-4 text-amber-500" />;
      case "STOP_SUGGESTION":
        return <MapPin className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "LOW":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!hasPermission(PERMISSIONS.NOTIFICATION_VIEW) || isAccessDenied) {
    return (
      <DashboardLayout>
        <AccessDenied variant="page" section="Notifications" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FullPageLoader show={loading} label="Fetching notification history..." />
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Notification Center"
          subtitle="Send alerts, updates and marketing messages to users and drivers."
          actions={
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate(ROUTES.NOTIFICATION_CREATE)}>
              <Send className="h-4 w-4 mr-2" /> Broadcast New
            </Button>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="dashboard-card border-none bg-blue-50/50 shadow-sm border-l-4 border-blue-500 rounded-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Messages Sent</p>
                <p className="text-2xl font-bold text-blue-900">{stats.sentCount.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="dashboard-card border-none bg-green-50/50 shadow-sm border-l-4 border-green-500 rounded-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Open Rate</p>
                <p className="text-2xl font-bold text-green-900">{stats.openRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="dashboard-card border-none bg-red-50/50 shadow-sm border-l-4 border-red-500 rounded-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-900">
                  {stats.criticalAlerts} {stats.criticalAlerts === 1 ? "Pending" : "Pending"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-card p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm border-border/60 rounded-xl">
          <Tabs
            value={statusFilter}
            onValueChange={(val) => updateFilters({ status: val })}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-[240px] h-10 bg-muted/20 border border-border/40">
              <TabsTrigger value="all" className="text-xs">
                ALL
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                UNREAD
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs">
                READ
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search history by title or content..."
              className="pl-10 h-10 border-border/60 rounded-lg bg-background/50 shadow-none focus-visible:ring-1"
              value={search}
              onChange={(e) => updateFilters({ q: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(val) => updateFilters({ type: val })}>
              <SelectTrigger className="w-[140px] h-10 border-border/60 rounded-lg shadow-none">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TRIP_UPDATE">Trip Updates</SelectItem>
                <SelectItem value="PAYMENT_SUCCESS">Payments</SelectItem>
                <SelectItem value="SYSTEM_ALERT">System</SelectItem>
                <SelectItem value="PROMOTIONAL">Marketing</SelectItem>
                <SelectItem value="RENTAL_REQUEST">Rentals</SelectItem>
                <SelectItem value="STOP_SUGGESTION">Suggestions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(val) => updateFilters({ priority: val })}>
              <SelectTrigger className="w-[140px] h-10 border-border/60 rounded-lg shadow-none">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            {(search || typeFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearchParams({}, { replace: true });
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Table/List View */}
        <div className="table-container rounded-xl shadow-sm border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Notification Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Target Group</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No notifications found.
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((n) => (
                  <TableRow
                    key={n.id}
                    className={`group transition-all duration-200 hover:bg-blue-50/30 cursor-pointer ${
                      !n.read ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
                    }`}
                    onClick={() => {
                      if (n.type === "RENTAL_REQUEST" && n.metadata?.rentalId) {
                        navigate(ROUTES.RENTAL_DETAILS.replace(":id", n.metadata.rentalId));
                      } else if (n.type === "STOP_SUGGESTION" && n.metadata?.suggestionId) {
                        navigate(ROUTES.SUGGESTION_DETAILS.replace(":id", n.metadata.suggestionId));
                      } else {
                        navigate(ROUTES.NOTIFICATION_DETAILS.replace(":id", n.id));
                      }
                    }}
                  >
                    <TableCell className="max-w-md">
                      <div className="flex gap-4">
                        {n.metadata?.images && n.metadata.images.length > 0 && (
                          <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 ring-1 ring-black/5 shadow-sm bg-gray-50 group-hover:ring-blue-200 transition-all">
                            <img src={n.metadata.images[0]} alt="thumb" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            {n.metadata.images.length > 1 && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black text-white">+{n.metadata.images.length - 1}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className={cn("font-bold text-gray-900 truncate flex items-center gap-2", !n.read && "text-blue-600")}>
                            {n.title}
                            {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />}
                          </span>
                          <span className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{n.content}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(n.type)}
                        <span className="text-xs font-medium text-gray-600">{n.type.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getPriorityBadge(n.priority || "MEDIUM")} text-[10px] py-0 px-2 font-bold`}
                      >
                        {n.priority || "MEDIUM"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5 inline-block">
                        {(n.targetGroup || "INDIVIDUAL").replace("_", " ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => navigate(ROUTES.NOTIFICATION_DETAILS.replace(":id", n.id))}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(n.id);
                            }}
                            disabled={n.read}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Read
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(n.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove Record
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
            className="mt-4"
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => updateFilters({ page })}
            onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
