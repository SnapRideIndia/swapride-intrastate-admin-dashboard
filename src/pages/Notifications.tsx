import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useEffect } from "react";
import { FullPageLoader } from "@/components/ui/full-page-loader";

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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await notificationService.getAll(1, 100);
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
      console.error("Failed to fetch notifications", error);
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
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" ? true : n.type === typeFilter;
    const matchesPriority = priorityFilter === "all" ? true : n.priority === priorityFilter;
    return matchesSearch && matchesType && matchesPriority;
  });

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

  const handleDelete = (id: string) => {
    if (confirm("Delete this notification history?")) {
      setNotifications(notifications.filter((n) => n.id !== id));
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
                <p className="text-2xl font-bold text-blue-900">1,240</p>
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
                <p className="text-2xl font-bold text-green-900">84.2%</p>
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
                <p className="text-2xl font-bold text-red-900">3 Pending</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="dashboard-card p-4 flex flex-col md:flex-row gap-4 shadow-sm border-gray-100 rounded-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter notification history..."
              className="pl-10 h-10 border-gray-100 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-10 border-gray-100 bg-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SYSTEM_ALERT">Critical</SelectItem>
                <SelectItem value="PROMOTIONAL">Marketing</SelectItem>
                <SelectItem value="TRIP_UPDATE">Trips</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px] h-10 border-gray-100 bg-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="HIGH">High Only</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            {(search || typeFilter !== "all" || priorityFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setPriorityFilter("all");
                }}
              >
                Clear
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
              {filteredNotifications.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No notifications found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotifications.map((n) => (
                  <TableRow
                    key={n.id}
                    className={`group hover:bg-gray-50/50 ${!n.isRead ? "border-l-4 border-l-blue-500" : ""}`}
                  >
                    <TableCell className="max-w-md">
                      <div className="flex flex-col gap-1">
                        <span className={`font-bold text-gray-900 ${!n.isRead ? "flex items-center" : ""}`}>
                          {n.title}
                          {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 ml-2" />}
                        </span>
                        <span className="text-sm text-gray-500 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                          {n.content}
                        </span>
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
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleDelete(n.id)}>
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" /> Remove Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
