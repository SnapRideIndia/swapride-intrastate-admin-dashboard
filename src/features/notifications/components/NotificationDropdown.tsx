import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useState, useEffect } from "react";
import { Bell, User, CreditCard, Bus, AlertCircle, CheckCircle, Tag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { notificationService } from "@/features/notifications/api/notification.service";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "driver_request":
      return User;
    case "payment_issue":
    case "PAYMENT_SUCCESS":
      return CreditCard;
    case "trip_assignment":
    case "TRIP_UPDATE":
      return Bus;
    case "system_alert":
    case "SYSTEM_ALERT":
      return AlertCircle;
    case "PROMOTIONAL":
      return Tag;
    default:
      return Bell;
  }
};

const getIconColor = (type: Notification["type"]) => {
  switch (type) {
    case "driver_request":
      return "text-primary bg-primary/10";
    case "payment_issue":
    case "PAYMENT_SUCCESS":
      return "text-destructive bg-destructive/10";
    case "trip_assignment":
    case "TRIP_UPDATE":
      return "text-success bg-success/10";
    case "system_alert":
    case "SYSTEM_ALERT":
      return "text-warning bg-warning/10";
    case "PROMOTIONAL":
      return "text-orange-500 bg-orange-100";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await notificationService.getAll(1, 10);
      setNotifications(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for custom event from useFcm when a new message arrives
    const handleNewNotification = () => {
      fetchNotifications();
    };

    window.addEventListener("fcm-message-received", handleNewNotification);

    return () => {
      window.removeEventListener("fcm-message-received", handleNewNotification);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-auto py-0.5 px-2 text-xs" onClick={fetchNotifications}>
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0.5 px-2 text-xs text-primary hover:text-primary"
                onClick={markAllAsRead}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
          ) : (
            notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer transition-all duration-200 hover:bg-accent hover:translate-x-1",
                    !notification.read && "bg-accent/30",
                  )}
                  onClick={() => {
                    markAsRead(notification.id);
                    navigate(ROUTES.NOTIFICATION_DETAILS.replace(":id", notification.id));
                  }}
                >
                  <div className={cn("p-2 rounded-full flex-shrink-0", getIconColor(notification.type))}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !notification.read && "font-medium")}>{notification.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notification.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.createdAt
                        ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                        : "Just now"}
                    </p>
                  </div>
                  {!notification.read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-primary cursor-pointer font-medium"
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
