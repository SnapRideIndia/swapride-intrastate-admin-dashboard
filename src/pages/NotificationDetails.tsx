import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bell,
  Clock,
  User,
  Info,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  Tag,
  Calendar,
  Layers,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { ROUTES } from "@/constants/routes";
import { format } from "date-fns";
import { useNotification, useMarkAsRead } from "@/features/notifications/hooks/useNotifications";

export default function NotificationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: notification, isLoading: loading } = useNotification(id || "");
  const markAsReadMutation = useMarkAsRead();

  useEffect(() => {
    if (notification && !notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  }, [notification]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "LOW":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TRIP_UPDATE":
        return <Info className="h-4 w-4 text-primary" />;
      case "PAYMENT_SUCCESS":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "TICKET_REPLY":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "SYSTEM_ALERT":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "PROMOTIONAL":
        return <Tag className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <FullPageLoader show={true} label="Fetching notification details..." />
      </DashboardLayout>
    );
  }

  if (!notification) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Notification Not Found"
          subtitle="Requested resource missing"
          backUrl={ROUTES.NOTIFICATIONS}
        />
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-muted/10 rounded-xl border border-dashed">
          <AlertTriangle className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">The notification record does not exist or has been deleted.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(ROUTES.NOTIFICATIONS)}>
            Back to List
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Notification Details"
        subtitle="View broadcast content and delivery metadata"
        backUrl={ROUTES.NOTIFICATIONS}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/60 overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-muted/5 flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">Message Content</CardTitle>
              </div>
              <div className="flex items-center text-xs text-muted-foreground gap-1">
                <Clock className="h-3 w-3" />
                {notification.createdAt ? format(new Date(notification.createdAt), "hh:mm a, MMM dd") : "Unknown"}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{notification.title}</h2>
              <div className="bg-muted/30 p-6 rounded-xl border border-border/40">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-[15px]">
                  {notification.content}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm border-border/60 bg-muted/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Target Group</p>
                  <p className="text-base font-semibold">
                    {notification.targetGroup?.replace(/_/g, " ") || "All Users"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="py-4 border-b border-border/60">
              <CardTitle className="text-base font-medium">Metadata Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">Category Type</p>
                <div className="flex items-center gap-2 font-medium text-sm">
                  {getTypeIcon(notification.type)}
                  {notification.type.replace(/_/g, " ")}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">Priority</p>
                <Badge variant="outline" className={`${getPriorityColor(notification.priority || "MEDIUM")} px-3 py-1`}>
                  {notification.priority || "MEDIUM"}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">Sent At</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {notification.createdAt ? format(new Date(notification.createdAt), "PPP") : "N/A"}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">Notification ID</p>
                <code className="text-[11px] bg-muted px-2 py-1 rounded block truncate font-mono border border-border/40">
                  {notification.id}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
