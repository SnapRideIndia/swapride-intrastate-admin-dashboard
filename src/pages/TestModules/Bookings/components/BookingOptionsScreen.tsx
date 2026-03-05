import { ChevronLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  return (
    <div className="flex-1 flex flex-col bg-[#F0F4F8] overflow-hidden h-full">
      {/* Header */}
      <div className="bg-white px-4 py-3 shrink-0 flex items-center">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={onBack}>
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
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

            <Button
              onClick={onShowReturnBuses}
              className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-extrabold text-[15px] h-12 rounded-xl shadow-sm border-b-2 border-amber-500/20 active:border-b-0 transition-all"
            >
              Show return buses
            </Button>
          </div>
        </Card>
      </div>

      {/* Placeholder for Bottom Nav */}
      <div className="h-[70px] bg-white border-t border-slate-50 opacity-0 pointer-events-none" />
    </div>
  );
}
