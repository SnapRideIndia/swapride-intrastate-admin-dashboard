import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users as UsersIcon,
  ChevronRight,
  Clock,
  Navigation2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/constants/routes";
import { RentalRequest } from "../types";
import { RentalStatusBadge } from "./RentalStatusBadge";

interface RentalCardProps {
  rental: RentalRequest;
}

export const RentalCard = ({ rental }: RentalCardProps) => {
  const navigate = useNavigate();

  const handleReview = () => {
    navigate(ROUTES.RENTAL_DETAILS.replace(":id", rental.id));
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <Card
      className="group relative overflow-hidden bg-white hover:bg-slate-50/50 transition-all duration-300 border border-slate-200/70 hover:border-primary/25 shadow-sm hover:shadow-md rounded-2xl cursor-pointer"
      onClick={handleReview}
    >
      {/* Top accent bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="p-5">
        {/* Header: status badge + created date */}
        <div className="flex justify-between items-center mb-5">
          <RentalStatusBadge status={rental.status} />
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Calendar className="h-3 w-3" />
            {formatDate(rental.createdAt)}
          </span>
        </div>

        {/* Route */}
        <div className="relative space-y-4 mb-5">
          {/* Connector line */}
          <div className="absolute left-[11px] top-[14px] bottom-[14px] w-px bg-gradient-to-b from-blue-400 to-indigo-400 opacity-40" />

          <div className="flex items-start gap-3.5">
            <div className="z-10 h-6 w-6 shrink-0 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-colors duration-300">
              <Navigation2 className="h-3 w-3 text-blue-500 group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Origin</p>
              <p className="text-xs font-semibold text-slate-700 truncate">{rental.originAddress}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="z-10 h-6 w-6 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors duration-300">
              <MapPin className="h-3 w-3 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Destination</p>
              <p className="text-xs font-semibold text-slate-700 truncate">{rental.destinationAddress}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {/* User + Passengers */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              <Avatar className="h-full w-full">
                <AvatarImage src={rental.user?.profileUrl || ""} />
                <AvatarFallback className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px]">
                  {rental.user?.fullName?.substring(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 leading-tight">
                {rental.user?.fullName || "Guest"}
              </p>
              <p className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <UsersIcon className="h-2.5 w-2.5" /> {rental.passengerRange} seats
              </p>
            </div>
          </div>

          {/* Departure + Button */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <Clock className="h-2.5 w-2.5 text-blue-400" />
                {formatDate(rental.departureDate)}
              </p>
              <p className="text-[9px] text-slate-400">Departure</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 px-3 text-xs font-semibold shadow-none"
              onClick={(e) => {
                e.stopPropagation();
                handleReview();
              }}
            >
              Review <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
