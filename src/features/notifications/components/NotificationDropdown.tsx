import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useState, useEffect } from "react";
import { 
  Bell, 
  User, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Megaphone, 
  MapPin, 
  MessageSquare,
  Bus,
  Tag
} from "lucide-react";
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

const getIcon = (type: string) => {
  switch (type) {
    case "driver_request":
      return User;
    case "payment_issue":
    case "PAYMENT_SUCCESS":
      return CreditCard;
    case "RENTAL_REQUEST":
      return Bus;
    case "STOP_SUGGESTION":
    case "trip_assignment":
    case "TRIP_UPDATE":
    case "PICKUP_NEARBY":
    case "DROPOFF_NEARBY":
      return MapPin;
    case "system_alert":
    case "SYSTEM_ALERT":
    case "ADMIN_ALERT":
      return AlertCircle;
    case "PROMOTIONAL":
    case "marketing":
      return Megaphone;
    case "TICKET_REPLY":
      return MessageSquare;
    case "COUPON_CREATED":
      return Tag;
    default:
      return Bell;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case "driver_request":
      return "text-indigo-600 bg-indigo-50";
    case "payment_issue":
      return "text-red-600 bg-red-50";
    case "PAYMENT_SUCCESS":
      return "text-blue-600 bg-blue-50";
    case "RENTAL_REQUEST":
      return "text-amber-600 bg-amber-50";
    case "STOP_SUGGESTION":
      return "text-blue-500 bg-blue-50";
    case "trip_assignment":
    case "TRIP_UPDATE":
    case "PICKUP_NEARBY":
    case "DROPOFF_NEARBY":
      return "text-emerald-600 bg-emerald-50";
    case "system_alert":
    case "SYSTEM_ALERT":
    case "ADMIN_ALERT":
      return "text-rose-600 bg-rose-50";
    case "PROMOTIONAL":
    case "marketing":
      return "text-orange-600 bg-orange-50";
    case "TICKET_REPLY":
      return "text-purple-600 bg-purple-50";
    case "COUPON_CREATED":
      return "text-pink-600 bg-pink-50";
    default:
      return "text-slate-600 bg-slate-50";
  }
};

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await notificationService.getAll({ limit: 10 });
      setNotifications(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

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
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
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
                    "flex flex-col items-stretch gap-0 p-0 cursor-pointer transition-all duration-200 hover:bg-accent/50",
                    !notification.read && "bg-accent/20",
                  )}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.type === "RENTAL_REQUEST" && notification.metadata?.rentalId) {
                      navigate(ROUTES.RENTAL_DETAILS.replace(":id", notification.metadata.rentalId));
                    } else if (notification.type === "STOP_SUGGESTION" && notification.metadata?.suggestionId) {
                      navigate(ROUTES.SUGGESTION_DETAILS.replace(":id", notification.metadata.suggestionId));
                    } else {
                      navigate(ROUTES.NOTIFICATION_DETAILS.replace(":id", notification.id));
                    }
                  }}
                >
                  <div className="flex items-start gap-3 p-3">
                    <div className={cn("p-2 rounded-xl flex-shrink-0 shadow-sm", getIconColor(notification.type))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-sm line-clamp-1", !notification.read ? "font-bold text-gray-900" : "font-medium text-gray-700")}>
                          {notification.title}
                        </p>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{notification.content}</p>
                      
                      {/* Image Preview in Dropdown */}
                      {notification.metadata?.images && notification.metadata.images.length > 0 && (
                        <div className="mt-2 relative aspect-video rounded-lg overflow-hidden ring-1 ring-black/5 shadow-inner bg-gray-50">
                          <img 
                            src={notification.metadata.images[0]} 
                            alt="preview" 
                            className="w-full h-full object-cover"
                          />
                          {notification.metadata.images.length > 1 && (
                            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest leading-none">
                              +{notification.metadata.images.length - 1} More
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium uppercase tracking-tight">
                        {notification.createdAt
                          ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                          : "Just now"}
                      </p>
                    </div>
                  </div>
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
