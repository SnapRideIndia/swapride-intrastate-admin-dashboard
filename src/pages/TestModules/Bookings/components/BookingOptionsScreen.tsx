import { ChevronLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BookingOptionsScreenProps {
  onBack: () => void;
  onProceedOneWay: () => void;
  onShowReturnBuses: () => void;
  price?: number;
}

export function BookingOptionsScreen({
  onBack,
  onProceedOneWay,
  onShowReturnBuses,
  price = 0,
}: BookingOptionsScreenProps) {
  const [perferredTime, setPreferredTime] = useState("");
  const [timeMode, setTimeMode] = useState<"AM" | "PM">("AM");

  return (
    <div className="flex-1 flex flex-col bg-[#F0F4F8] overflow-hidden h-full">
      {/* Header */}
      <div className="bg-white px-4 py-3 shrink-0 flex items-center">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={onBack}>
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Book One-way Card */}
        <Card className="rounded-[2.5rem] p-6 border-none shadow-sm bg-white overflow-hidden">
          <div className="space-y-4">
            <div>
              <h3 className="text-[17px] font-black text-slate-800 tracking-tight">Book One-way ride</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-500">Free rescheduling, Cancel anytime</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[28px] font-black text-emerald-500 leading-none">₹{price}</span>
              <Button
                onClick={onProceedOneWay}
                className="bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-extrabold text-[15px] px-10 h-11 rounded-xl shadow-sm border-b-2 border-amber-500/20 active:border-b-0 transition-all"
              >
                Proceed
              </Button>
            </div>
          </div>
        </Card>

        {/* Return Ride Card */}
        <Card className="rounded-[2.5rem] p-6 border-none shadow-sm bg-white overflow-hidden">
          <div className="space-y-4">
            <div>
              <h3 className="text-[17px] font-black text-slate-800 tracking-tight">Need a return ride too?</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Free cancellation if your plans change later</p>
            </div>

            <div className="space-y-2 relative">
              <label className="text-[11px] font-bold text-slate-400">Preffered Time</label>
              <div className="flex items-center border-b border-slate-200 pb-2">
                <input
                  type="text"
                  value={perferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700"
                  placeholder=""
                />
                <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
                  <button
                    onClick={() => setTimeMode("AM")}
                    className={cn(
                      "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                      timeMode === "AM" ? "bg-blue-900 text-white shadow-sm" : "text-blue-900/40",
                    )}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setTimeMode("PM")}
                    className={cn(
                      "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                      timeMode === "PM" ? "bg-blue-900 text-white shadow-sm" : "text-blue-900/40",
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={onShowReturnBuses}
              className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-extrabold text-[15px] h-12 rounded-xl shadow-sm border-b-2 border-amber-500/20 active:border-b-0 transition-all"
            >
              Show return buses
            </Button>
          </div>
        </Card>
      </div>

      {/* Placeholder for Bottom Nav (Ignored as per request, but keeping spacing if needed) */}
      <div className="h-[70px] bg-white border-t border-slate-50 opacity-0 pointer-events-none" />
    </div>
  );
}
