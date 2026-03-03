import { ChevronLeft, X, Sun, Moon, Clock, Info, ShieldCheck, Armchair, CheckCircle2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ApplyCouponModal } from "./ApplyCouponModal";
import { BookingResponse, RoundTripBookingResponse, SearchResult, SearchTiming } from "../types/search";
import { format, differenceInSeconds } from "date-fns";

interface ConfirmBookingScreenProps {
  outbound: { result: SearchResult; timing: SearchTiming };
  returnTrip?: { result: SearchResult; timing: SearchTiming };
  bookingResponse: BookingResponse | null;
  roundTripResponse: RoundTripBookingResponse | null;
  onBack: () => void;
  onConfirm: () => void;
  onChangeSeat: (leg: "outbound" | "return") => void;
}

export function ConfirmBookingScreen({
  outbound,
  returnTrip,
  bookingResponse,
  roundTripResponse,
  onBack,
  onConfirm,
  onChangeSeat,
}: ConfirmBookingScreenProps) {
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const expiry = roundTripResponse ? roundTripResponse.expiresAt : bookingResponse?.expiresAt;
    if (!expiry) return;

    const timer = setInterval(() => {
      const diff = differenceInSeconds(new Date(expiry), new Date());
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
      } else {
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingResponse, roundTripResponse]);

  const outboundData = roundTripResponse ? roundTripResponse.outbound : bookingResponse;
  const totalPayable = roundTripResponse ? roundTripResponse.totalPayable : bookingResponse?.totalAmount || 0;
  const discountTotal = roundTripResponse
    ? roundTripResponse.outbound.discountAmount + roundTripResponse.return.discountAmount
    : bookingResponse?.discountAmount || 0;

  return (
    <div className="flex-1 flex flex-col bg-[#F0F4F8] overflow-hidden h-full">
      {/* Header */}
      <div className="bg-white px-4 py-4 shrink-0 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
            <ChevronLeft className="h-5 w-5 text-slate-900" />
          </Button>
          <h2 className="text-[17px] font-black text-slate-900">Confirm Booking Details</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <X className="h-5 w-5 text-slate-900" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 space-y-4">
          {/* Outbound Trip Card */}
          <TripDetailCard
            title={format(new Date(outbound.timing.pickupArrivalTime), "EEEE, do MMM")}
            type="outbound"
            result={outbound}
            booking={outboundData}
            onChangeSeat={() => onChangeSeat("outbound")}
          />

          {/* Return Trip Card (Conditional) */}
          {returnTrip && roundTripResponse && (
            <TripDetailCard
              title={format(new Date(returnTrip.timing.pickupArrivalTime), "EEEE, do MMM")}
              type="return"
              result={returnTrip}
              booking={roundTripResponse.return}
              onChangeSeat={() => onChangeSeat("return")}
            />
          )}

          {/* Fare Details */}
          <div className="bg-white rounded-[2.5rem] p-6 space-y-4 shadow-sm border border-slate-50">
            <h3 className="text-lg font-black text-slate-900">Fare Details</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">outbound ride fare</span>
                <span className="text-slate-900 font-black">₹{outboundData?.subTotal || outbound.result.baseFare}</span>
              </div>

              {returnTrip && roundTripResponse && (
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">Return ride fare</span>
                  <span className="text-slate-900 font-black">₹{roundTripResponse.return.subTotal}</span>
                </div>
              )}

              {discountTotal > 0 && (
                <div className="flex justify-between items-center text-sm font-medium text-green-600">
                  <span className="font-bold">Total Discount</span>
                  <span className="font-black">- ₹{discountTotal}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-medium">
                <div>
                  <span className="text-slate-500">Swapride Wallet</span>
                  <p className="text-[10px] text-slate-400 font-bold">(Remaining Bal : 0)</p>
                </div>
                <span className="text-slate-900 font-black">- ₹0</span>
              </div>
            </div>

            {appliedCoupon ? (
              <div className="space-y-4">
                {/* Variant 1: Checkmark State */}
                <div className="flex items-center justify-center gap-2 py-2">
                  <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                  <span className="text-[#22C55E] text-[13px] font-black uppercase tracking-wider">Coupon Applied</span>
                </div>

                {/* Variant 2: Savings Banner */}
                <div className="bg-[#E4F2E7] rounded-xl p-3 flex items-center justify-between border border-[#D1EAD7]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#22C55E] rounded-lg flex items-center justify-center shadow-sm">
                      <Ticket className="h-4 w-4 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-[#15803D] leading-none uppercase">You Saved ₹20.20</p>
                      <p className="text-[10px] font-bold text-[#15803D]/60 mt-0.5">with {appliedCoupon}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="h-6 w-6 rounded-full border border-[#15803D]/20 flex items-center justify-center text-[#15803D]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="text-blue-600 text-sm font-black hover:underline pt-1"
              >
                Apply Promo code?
              </button>
            )}

            <div className="pt-4 border-t border-dotted border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-slate-900">Total Payable</span>
                <span className="text-lg font-black text-slate-900">₹{totalPayable}</span>
              </div>
            </div>

            {/* Hold Timer */}
            {timeLeft && (
              <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between border border-amber-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-[11px] font-black text-amber-900 uppercase">Seats held for</span>
                </div>
                <span className="text-sm font-black text-amber-600 tabular-nums">{timeLeft}</span>
              </div>
            )}

            {/* Policy Info Box */}
            <div className="bg-blue-50/50 rounded-2xl p-4 space-y-3 mt-4 border border-blue-50">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-slate-900 shrink-0" />
                <p className="text-[11px] font-medium text-slate-700 leading-tight">
                  Reschedule your ride anytime - vehicle timings, stops or seat at no extra cost
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full border border-slate-900 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black">₹</span>
                </div>
                <p className="text-[11px] font-medium text-slate-700 leading-tight">
                  Cancel more than 30 minutes before your ride & get the full refund to your swapride wallet
                </p>
              </div>
            </div>
          </div>

          {/* Policy Section */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900">Cancellation & Reschedule Policy</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="bg-white p-4 border-t border-slate-100 shrink-0">
        <Button
          onClick={onConfirm}
          className="w-full h-12 bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-black text-[15px] rounded-xl shadow-lg flex items-center justify-center gap-1 group"
        >
          Proceed to payment
          <ChevronLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <ApplyCouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        onApply={(code) => {
          setIsCouponModalOpen(false);
          setAppliedCoupon(code || "DLV25");
        }}
      />
    </div>
  );
}

function TripDetailCard({
  title,
  type,
  result,
  booking,
  onChangeSeat,
}: {
  title: string;
  type: "outbound" | "return";
  result: { result: SearchResult; timing: SearchTiming };
  booking: BookingResponse | null | undefined;
  onChangeSeat: () => void;
}) {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-50">
      <div
        className={cn(
          "px-5 py-3 flex items-center justify-between",
          type === "outbound" ? "bg-blue-600" : "bg-blue-800",
        )}
      >
        <div className="flex items-center gap-2 text-white">
          {type === "outbound" ? <Sun className="h-4 w-4 fill-white" /> : <Moon className="h-4 w-4 fill-white" />}
          <span className="text-xs font-black">{title}</span>
        </div>
        {type === "return" && (
          <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
            Return
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="relative mb-6">
          <div className="absolute left-[5.5px] top-6 bottom-6 w-0 border-l border-dotted border-slate-300" />

          <div className="space-y-6">
            <div className="flex gap-3 relative">
              <div className="h-3 w-3 rounded-full bg-[#FFC107] z-10 shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-[14px] font-black text-slate-900 leading-tight">{result.result.pickup.name}</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{result.result.pickup.address}</p>
                <div className="flex items-center gap-1.5 mt-1.5 opacity-70">
                  <span className="text-[10px] font-black text-slate-900">
                    🏃 {result.result.pickup.distanceText} walk
                  </span>
                </div>
              </div>
              <div className="bg-amber-100 text-amber-700 font-black text-[10px] px-2 py-1 rounded-lg h-fit">
                {format(new Date(result.timing.pickupArrivalTime), "h:mm a")}
              </div>
            </div>

            <div className="flex gap-3 relative">
              <div className="h-3 w-3 rounded-full bg-blue-900 z-10 shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-[14px] font-black text-slate-900 leading-tight">{result.result.dropoff.name}</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{result.result.dropoff.address}</p>
                <div className="flex items-center gap-1.5 mt-1.5 opacity-70">
                  <span className="text-[10px] font-black text-slate-900">
                    🏃 {result.result.dropoff.distanceText} walk
                  </span>
                </div>
              </div>
              <div className="bg-amber-100 text-amber-700 font-black text-[10px] px-2 py-1 rounded-lg h-fit">
                {format(new Date(result.timing.dropoffArrivalTime), "h:mm a")}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-dotted border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Armchair className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[15px] font-black text-slate-900 leading-none">
                {booking?.assignedSeats?.map((s) => s.seatNumber).join(", ") || "--"}{" "}
                <span className="text-[11px] font-bold text-slate-400">Auto assigned</span>
              </p>
            </div>
          </div>
          <button onClick={onChangeSeat} className="text-blue-600 text-sm font-black hover:underline tracking-tight">
            Change Seat
          </button>
        </div>
      </div>
    </div>
  );
}
