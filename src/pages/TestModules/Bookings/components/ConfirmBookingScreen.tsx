import { ChevronLeft, X, Sun, Moon, Clock, Info, ShieldCheck, Armchair, CheckCircle2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ApplyCouponModal } from "./ApplyCouponModal";
import { BookingResponse, RoundTripBookingResponse, SearchResult, SearchTiming, BookingDetails } from "../types/search";
import { format, differenceInSeconds } from "date-fns";

interface ConfirmBookingScreenProps {
  outbound: { result: SearchResult; timing: SearchTiming };
  returnTrip?: { result: SearchResult; timing: SearchTiming };
  bookingResponse: BookingResponse | null;
  roundTripResponse: RoundTripBookingResponse | null;
  onBack: () => void;
  onConfirm: () => void;
  onChangeSeat: (leg: "outbound" | "return") => void;
  bookingDetails?: BookingDetails | null;
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  onRemoveCoupon: () => Promise<void>;
}
export function ConfirmBookingScreen({
  outbound,
  returnTrip,
  bookingResponse,
  roundTripResponse,
  onBack,
  onConfirm,
  onChangeSeat,
  bookingDetails,
  onApplyCoupon,
  onRemoveCoupon,
}: ConfirmBookingScreenProps) {
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isProcessingCoupon, setIsProcessingCoupon] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const expiry = bookingDetails
      ? bookingDetails.expiresAt
      : roundTripResponse
        ? roundTripResponse.expiresAt
        : bookingResponse?.expiresAt;
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

  const outboundData = bookingDetails
    ? bookingDetails.isRoundTrip
      ? (bookingDetails as any).outbound
      : bookingDetails
    : roundTripResponse
      ? roundTripResponse.outbound
      : bookingResponse;

  const totalPayable = bookingDetails
    ? bookingDetails.totalPayable
    : roundTripResponse
      ? roundTripResponse.totalPayable
      : bookingResponse?.totalAmount || 0;

  const discountTotal = bookingDetails
    ? bookingDetails.isRoundTrip
      ? (bookingDetails as any).outbound.discountAmount + (bookingDetails as any).return.discountAmount
      : (bookingDetails as any).discountAmount
    : roundTripResponse
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

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-4">
          {/* Outbound Trip Card */}
          <TripDetailCard
            title={format(new Date(outbound.timing.pickupArrivalTime), "EEEE, do MMM")}
            type="outbound"
            result={outbound}
            booking={outboundData}
            onChangeSeat={() => onChangeSeat("outbound")}
            details={bookingDetails?.isRoundTrip === false ? bookingDetails : (bookingDetails as any)?.outbound}
          />

          {/* Return Trip Card (Conditional) */}
          {((returnTrip && roundTripResponse) || bookingDetails?.isRoundTrip) && (
            <TripDetailCard
              title={format(
                new Date(returnTrip?.timing.pickupArrivalTime || (bookingDetails as any).return.pickup.arrivalTime),
                "EEEE, do MMM",
              )}
              type="return"
              result={returnTrip || { result: {} as any, timing: {} as any }}
              booking={(bookingDetails as any)?.return || roundTripResponse?.return}
              onChangeSeat={() => onChangeSeat("return")}
              details={(bookingDetails as any)?.return}
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

            {outboundData?.coupon ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 text-[13px] font-black uppercase tracking-wider">
                      Coupon Applied
                    </span>
                  </div>
                  {outboundData.coupon.isAutoApply && (
                    <div className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                      Auto-Applied
                    </div>
                  )}
                </div>

                <div className="bg-green-50 rounded-2xl p-4 flex items-center justify-between border border-green-100 shadow-sm transition-all hover:border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
                      <Ticket className="h-5 w-5 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-green-800 leading-none uppercase tracking-tight">
                        You Saved ₹{outboundData.coupon.discountAmount}
                      </p>
                      <p className="text-[11px] font-bold text-green-700/60 mt-1">with {outboundData.coupon.code}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsProcessingCoupon(true);
                      await onRemoveCoupon();
                      setIsProcessingCoupon(false);
                    }}
                    disabled={isProcessingCoupon}
                    className="h-10 w-10 rounded-xl bg-white border border-green-100 flex items-center justify-center text-green-700 shadow-sm hover:bg-green-50 active:scale-90 transition-all disabled:opacity-50"
                  >
                    {isProcessingCoupon ? (
                      <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="group flex items-center gap-3 w-full p-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
              >
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-blue-600">Apply Promo code</p>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Tap to view offers</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-blue-300 rotate-180" />
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
        onClose={() => {
          setIsCouponModalOpen(false);
          setCouponError(null);
        }}
        isLoading={isApplyingCoupon}
        error={couponError}
        onApply={async (code) => {
          if (!code.trim()) return;
          setCouponError(null);
          setIsApplyingCoupon(true);
          const result = await onApplyCoupon(code);
          setIsApplyingCoupon(false);

          if (result.success) {
            setIsCouponModalOpen(false);
          } else {
            setCouponError(result.message || "Failed to apply coupon");
          }
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
  details,
}: {
  title: string;
  type: "outbound" | "return";
  result: { result: SearchResult; timing: SearchTiming };
  booking: BookingResponse | null | undefined;
  onChangeSeat: () => void;
  details?: any;
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
                    🏃 {details?.pickup?.distanceText || result.result.pickup?.distanceText} walk (
                    {details?.pickup?.walkDurationText || "calculating..."})
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
                    🏃 {details?.dropoff?.distanceText || result.result.dropoff?.distanceText || "0 km"} walk
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
