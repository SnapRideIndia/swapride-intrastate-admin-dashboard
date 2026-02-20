import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Bell,
  Info,
  AlertTriangle,
  MessageSquare,
  Send,
  Check,
  Eye,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@\/components\/ui\/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notificationService } from "@/features/notifications/api/notification.service";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";

// Mock Data Type based on DB Design
type AppNotification = {
  id: string;
  title: string;
  content: string;
  type: "TRIP_UPDATE" | "PAYMENT_SUCCESS" | "TICKET_REPLY" | "SYSTEM_ALERT" | "PROMOTIONAL";
  priority: "LOW" | "MEDIUM" | "HIGH";
  recipient: string; // "ALL_USERS", "ALL_DRIVERS", "INDIVIDUAL"
  isRead: boolean;
  createdAt: string;
};

const MOCK_NOTIFICATIONS: AppNotification[] = [];

export default function Notifications() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ sentCount: 0, openRate: 0, criticalAlerts: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Sync state with URL params
  const search = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type") || "all";
  const priorityFilter = searchParams.get("priority") || "all";
  const statusFilter = searchParams.get("status") || "all";

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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await notificationService.getAll(1, 100);
      try {
        const statsData = await notificationService.getStats();
        setStats(statsData);
      } catch (e) {}
      // Map API fields to UI fields if necessary
      const mapped = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        type: n.type,
        priority: n.priority,
        recipient: n.targetGroup || "INDIVIDUAL",
        isRead: n.read,
        createdAt: n.createdAt,
      }));
      setNotifications(mapped);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for new messages to refresh list
    const handleRefresh = () => fetchNotifications();
    window.addEventListener("fcm-message-received", handleRefresh);
    return () => window.removeEventListener("fcm-message-received", handleRefresh);
  }, [searchParams]); // Re-fetch when search params change

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, priorityFilter, statusFilter]);

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" ? true : n.type === typeFilter;
    const matchesPriority = priorityFilter === "all" ? true : n.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" ? true : statusFilter === "unread" ? !n.isRead : n.isRead;
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredNotifications.slice(start, end);
  }, [filteredNotifications, currentPage, pageSize]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TRIP_UPDATE":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "PAYMENT_SUCCESS":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "TICKET_REPLY":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "SYSTEM_ALERT":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "PROMOTIONAL":
        return <Tag className="h-4 w-4 text-orange-500" />;
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

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {}
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this notification history?")) {
      try {
        await notificationService.delete(id);
        setNotifications(notifications.filter((n) => n.id !== id));
      } catch (error) {}
    }
  };

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
              placeholder="Search history..."
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
              {paginatedNotifications.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No notifications found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNotifications.map((n) => (
                  <TableRow
                    key={n.id}
                    className={`group transition-all duration-200 hover:bg-blue-50/30 cursor-pointer ${
                      !n.isRead ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
                    }`}
                    onClick={() => navigate(ROUTES.NOTIFICATION_DETAILS.replace(":id", n.id))}
                  >
                    <TableCell className="max-w-md">
                      <div className="flex flex-col gap-1">
                        <span className={`font-bold text-gray-900 ${!n.isRead ? "flex items-center" : ""}`}>
                          {n.title}
                          {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 ml-2" />}
                        </span>
                        <span className="text-sm text-gray-500 line-clamp-1">{n.content}</span>
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
                        className={`${getPriorityBadge(n.priority)} text-[10px] py-0 px-2 font-bold`}
                      >
                        {n.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5 inline-block">
                        {n.recipient.replace("_", " ")}
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
                            disabled={n.isRead}
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
            totalCount={filteredNotifications.length}
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
