import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Ticket,
  Bus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Grid,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingStatusBadge, BoardingStatusBadge } from "@/features/bookings/components/StatusBadges";
import { bookingService } from "@/features/bookings/api/booking.service";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Booking } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { LayoutPreviewGrid, busLayoutService } from "@/features/buses";
import { busService } from "@/features/buses/api/bus.service";
import { BusLayout } from "@/types";

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<BusLayout | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await bookingService.getById(id);
      setBooking(data);

      // Try to fetch bus layout from booking data or separately
      if (data.trip?.bus?.layout) {
        setLayout(data.trip.bus.layout);
      } else if (data.trip?.busId) {
        try {
          const bus = await busService.getById(data.trip.busId);
          if (bus.layout) {
            setLayout(bus.layout);
          } else if (bus.layoutId) {
            const layoutData = await busLayoutService.getById(bus.layoutId);
            if (layoutData) setLayout(layoutData);
          }
        } catch (e) {
          // Fallback to a standard template for preview
          const template = busLayoutService.applyTemplate("standard_2x2_40");
          setLayout(template as BusLayout);
        }
      }
    } catch (error) {
      toast.error("Could not load booking records");
      navigate(ROUTES.BOOKINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (!booking && !loading) return null;

  return (
    <DashboardLayout>
      <FullPageLoader show={loading} label="Accessing encrypted booking data..." />
      {booking && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(ROUTES.BOOKINGS)}
              className="rounded-full hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 flex-wrap">
                Booking{" "}
                <span className="font-mono text-xl text-slate-400">
                  #{booking.id?.split("-")[0].toUpperCase() || "N/A"}
                </span>
                {booking.paymentId ? (
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-600 border-indigo-100 font-mono px-3 py-1 text-[10px] ml-auto lg:ml-0"
                  >
                    PID: {booking.paymentId}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-rose-50 text-rose-600 border-rose-100 font-mono px-3 py-1 text-[10px] ml-auto lg:ml-0"
                  >
                    UNPAID
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-slate-500">Recorded on {new Date(booking.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Lifecycle & Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status & Lifecycle Timeline */}
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                  <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Operational Lifecycle
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="relative flex justify-between items-start">
                    {/* Connecting Line */}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0" />

                    <TimelineStep
                      label="Initiated"
                      time={new Date(booking.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      active={true}
                      completed={booking.bookingStatus !== "HELD"}
                    />
                    <TimelineStep
                      label="Confirmed"
                      time={
                        booking.bookingStatus === "CONFIRMED"
                          ? "Verified"
                          : booking.bookingStatus === "CANCELLED"
                            ? "Voided"
                            : "Pending"
                      }
                      active={booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "CANCELLED"}
                      completed={booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "CANCELLED"}
                      variant={booking.bookingStatus === "CANCELLED" ? "error" : "default"}
                    />
                    <TimelineStep
                      label="Boarded"
                      time={booking.boardingStatus === "BOARDED" ? "Complete" : "Awaiting"}
                      active={booking.boardingStatus === "BOARDED"}
                      completed={booking.boardingStatus === "BOARDED"}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Journey Details */}
              <Card className="border-none shadow-sm rounded-xl">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Bus className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trip Details</p>
                          <h3 className="font-bold text-slate-900">{booking.trip?.routeName || "N/A"}</h3>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <DetailItem
                          icon={Calendar}
                          label="Travel Date"
                          value={new Date(booking.trip?.date || "").toLocaleDateString("en-IN", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        />
                        <DetailItem icon={Clock} label="Departure" value={booking.trip?.scheduledStartTime || "N/A"} />
                        <DetailItem icon={Bus} label="Bus Unit" value={booking.trip?.busNumber || "N/A"} />
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Boarding Points</p>
                          <h3 className="font-bold text-slate-900">Direct Route</h3>
                        </div>
                      </div>

                      <div className="space-y-2 relative pl-6">
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-dashed border-l-2 border-slate-100" />
                        <div className="flex flex-col gap-1 pb-4">
                          <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-white" />
                          <span className="text-xs font-bold text-slate-400">PICKUP</span>
                          <span className="text-sm font-semibold text-slate-800">
                            {booking.pickupStop?.name || "Main Station"}
                          </span>
                          <span className="text-[11px] text-slate-500 leading-tight">
                            {booking.pickupStop?.address}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 mt-4">
                          <div className="absolute left-0 top-[84%] h-3.5 w-3.5 rounded-full border-2 border-rose-500 bg-white" />
                          <span className="text-xs font-bold text-slate-400">DROPOFF</span>
                          <span className="text-sm font-semibold text-slate-800">
                            {booking.dropStop?.name || "Destination"}
                          </span>
                          <span className="text-[11px] text-slate-500 leading-tight">{booking.dropStop?.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Breakdown */}
              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
                    Fare Summary
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-slate-300" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 italic">Base Fare ({booking.seats?.length || 0} Seats)</span>
                      <span className="font-semibold text-slate-700">₹{booking.subTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Service Fee & Tax</span>
                      <span className="font-semibold text-slate-700">
                        ₹
                        {(
                          Number(booking.totalAmount) -
                          Number(booking.subTotal) +
                          Number(booking.discountAmount)
                        ).toFixed(2)}
                      </span>
                    </div>
                    {Number(booking.discountAmount) > 0 && (
                      <div className="flex justify-between text-sm bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        <span className="text-emerald-700 font-medium flex items-center gap-2">
                          <Ticket className="h-3.5 w-3.5" /> Coupon Discount
                        </span>
                        <span className="font-bold text-emerald-700">- ₹{booking.discountAmount}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-slate-100 flex justify-between">
                      <span className="font-bold text-slate-900 underline decoration-slate-200 decoration-2 underline-offset-4 tracking-tight">
                        Total Payable Amount
                      </span>
                      <span className="text-xl font-black text-slate-900 flex flex-col items-end">
                        ₹{booking.totalAmount}
                        {booking.paymentId && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase">
                            PID: {booking.paymentId}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Passenger & Seats */}
            <div className="space-y-6">
              {/* Passenger Profile */}
              <Card
                className="border-none shadow-sm rounded-xl bg-slate-900 text-white overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all group"
                onClick={() => navigate(ROUTES.USER_DETAILS.replace(":id", booking.userId))}
              >
                <CardHeader className="bg-slate-800/50 border-b border-white/5">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between text-center">
                    <div className="flex items-center gap-2 px-1">
                      <User className="h-3 w-3" /> Passenger Record
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white/10 shadow-xl overflow-hidden text-2xl font-black">
                      {booking.user?.fullName?.[0] || "G"}
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">
                        {booking.user?.fullName || "Guest Passenger"}
                      </h2>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px] mt-1">
                        VERIFIED USER
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{booking.user?.mobileNumber || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{booking.user?.email || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seat Map Visualizer */}
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="py-4 border-b border-slate-100">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                    <span>Selected Seats</span>
                    <span className="text-indigo-600">{booking.seats?.length || 0} Reserved</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {layout ? (
                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <LayoutPreviewGrid
                        layout={layout}
                        selectedSeats={booking.seats?.map((s) => s.seatId)}
                        compact={true}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
                      <Grid className="h-10 w-10 mb-2 opacity-50" />
                      <p className="text-xs">No layout available for this unit</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions Sidebar */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Administrative Actions
                </p>
                <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-12 shadow-sm font-bold tracking-tight">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Download Invoice
                </Button>
                {booking.bookingStatus === "CONFIRMED" && (
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl h-12 shadow-sm font-bold tracking-tight bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-none"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function TimelineStep({
  label,
  time,
  active,
  completed,
  variant = "default",
}: {
  label: string;
  time: string;
  active: boolean;
  completed: boolean;
  variant?: "default" | "error";
}) {
  return (
    <div className="flex flex-col items-center gap-2 z-10 w-24">
      <div
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
          completed && variant === "default"
            ? "bg-emerald-500 border-emerald-100 text-white"
            : completed && variant === "error"
              ? "bg-rose-500 border-rose-100 text-white"
              : active
                ? "bg-white border-indigo-500 text-indigo-500"
                : "bg-white border-slate-100 text-slate-300",
        )}
      >
        {completed && variant === "default" ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : completed && variant === "error" ? (
          <XCircle className="h-5 w-5" />
        ) : active ? (
          <Clock className="h-5 w-5 animate-pulse" />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
        )}
      </div>
      <div className="text-center">
        <p
          className={cn("text-xs font-black uppercase tracking-tighter", active ? "text-slate-900" : "text-slate-400")}
        >
          {label}
        </p>
        <p className="text-[10px] font-medium text-slate-400">{time}</p>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-slate-400" />
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
