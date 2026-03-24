import { Badge } from "@/components/ui/badge";
import { RentalStatus } from "../types";

export const RentalStatusBadge = ({ status }: { status: RentalStatus }) => {
  const config = {
    PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200" },
    CALLED: { label: "Called", className: "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200" },
    QUOTED: { label: "Quoted", className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200" },
    CONFIRMED: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200" },
    CANCELLED: { label: "Cancelled", className: "bg-rose-100 text-rose-700 hover:bg-rose-100/80 border-rose-200" },
  };

  const item = config[status] || { label: status, className: "" };

  return (
    <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold uppercase ${item.className}`}>
      {item.label}
    </Badge>
  );
};
