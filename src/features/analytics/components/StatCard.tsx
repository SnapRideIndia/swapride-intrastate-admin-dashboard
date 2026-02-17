import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  href?: string;
  onClick?: () => void;
  vibrant?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconBgColor = "bg-primary-100",
  iconColor = "text-primary",
  href,
  onClick,
  vibrant = false,
}: StatCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  const isClickable = href || onClick;

  const getVibrantStyles = () => {
    if (!vibrant) return "";

    switch (iconColor) {
      case "text-primary":
        return "border-none bg-gradient-to-br from-blue-50/50 to-white shadow-sm";
      case "text-success":
        return "border-none bg-gradient-to-br from-green-50/50 to-white shadow-sm";
      case "text-info":
        return "border-none bg-gradient-to-br from-purple-50/50 to-white shadow-sm";
      case "text-warning":
        return "border-none bg-gradient-to-br from-yellow-50/50 to-white shadow-sm";
      case "text-destructive":
        return "border-none bg-gradient-to-br from-red-50/50 to-white shadow-sm";
      default:
        return "border-none bg-gradient-to-br from-blue-50/50 to-white shadow-sm";
    }
  };

  const getVibrantTextStyles = () => {
    if (!vibrant) return "text-muted-foreground";

    switch (iconColor) {
      case "text-primary":
        return "text-blue-900";
      case "text-success":
        return "text-green-900";
      case "text-info":
        return "text-purple-900";
      case "text-warning":
        return "text-yellow-900";
      case "text-destructive":
        return "text-red-900";
      default:
        return "text-blue-900";
    }
  };

  const getVibrantValueStyles = () => {
    if (!vibrant) return "text-foreground";

    switch (iconColor) {
      case "text-primary":
        return "text-blue-950";
      case "text-success":
        return "text-green-950 text-3xl";
      case "text-info":
        return "text-purple-950";
      case "text-warning":
        return "text-yellow-950";
      case "text-destructive":
        return "text-red-950";
      default:
        return "text-blue-950";
    }
  };

  return (
    <div
      className={cn(
        "stat-card",
        vibrant ? getVibrantStyles() : "",
        isClickable && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
      )}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm font-medium", getVibrantTextStyles())}>{title}</p>
          <p className={cn("mt-1 text-2xl font-bold", getVibrantValueStyles())}>{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                vibrant ? "opacity-80 italic" : "",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && (vibrant ? getVibrantTextStyles() : "text-muted-foreground"),
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn(vibrant ? "" : cn("stat-card-icon", iconBgColor))}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}
