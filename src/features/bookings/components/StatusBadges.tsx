import { Badge } from "@/components/ui/badge";
import { BookingStatus, BoardingStatus } from "@/types";
import { cn } from "@/lib/utils";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const getStyles = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "HELD":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "EXPIRED":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn("px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase", getStyles(status), className)}
    >
      {status}
    </Badge>
  );
}

interface BoardingStatusBadgeProps {
  status: BoardingStatus;
  className?: string;
}

export function BoardingStatusBadge({ status, className }: BoardingStatusBadgeProps) {
  const getStyles = (status: BoardingStatus) => {
    switch (status) {
      case "BOARDED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "NOT_BOARDED":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "NO_SHOW":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn("px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase", getStyles(status), className)}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}
