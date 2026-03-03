import { ChevronLeft, ArrowUpDown, Calendar, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { addDays, format, isSameDay } from "date-fns";
import { Location } from "../../types";

interface SearchScreenProps {
  source: Location;
  setSource: (loc: Location) => void;
  destination: Location;
  setDestination: (loc: Location) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onBack: () => void;
  onSearch: () => void;
  onOpenPicker: (type: "source" | "destination") => void;
}

export function SearchScreen({
  source,
  setSource,
  destination,
  setDestination,
  selectedDate,
  setSelectedDate,
  onBack,
  onSearch,
  onOpenPicker,
}: SearchScreenProps) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-slate-50" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 text-slate-800" />
        </Button>
      </div>

      <div className="flex-1 px-4 pb-6">
        <Card className="p-5 rounded-3xl border border-slate-100 shadow-sm bg-white relative space-y-4 flex flex-col">
          {/* Visual Route Connector */}
          <div className="absolute left-[25px] top-[48px] h-[58px] w-[1px] border-l border-dashed border-slate-300 z-0" />

          <div className="space-y-4 relative z-10">
            {/* Pickup */}
            <div className="flex items-start gap-4 cursor-pointer group" onClick={() => onOpenPicker("source")}>
              <div className="mt-1.5 h-2 w-2 rounded-full bg-amber-400 shrink-0 shadow-sm" />
              <div className="flex-1 min-w-0 border-b border-slate-100 pb-3 group-hover:border-slate-200 transition-colors">
                <label className="text-xs font-bold text-slate-800 block mb-1">Pickup</label>
                <p className={cn("text-xs font-medium truncate", source.text ? "text-slate-900" : "text-slate-300")}>
                  {source.text || "Where from?"}
                </p>
              </div>
            </div>

            {/* Swap Button */}
            <div className="absolute right-0 top-[28px] z-20">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-90 transition-all border-2 border-white"
                onClick={(e) => {
                  e.stopPropagation();
                  const tmp = source;
                  setSource(destination);
                  setDestination(tmp);
                }}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Dropoff */}
            <div className="flex items-start gap-4 cursor-pointer group" onClick={() => onOpenPicker("destination")}>
              <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-900 shrink-0 shadow-sm" />
              <div className="flex-1 min-w-0 border-b border-slate-100 pb-3 group-hover:border-slate-200 transition-colors">
                <label className="text-xs font-bold text-slate-800 block mb-1">Dropoff</label>
                <p
                  className={cn("text-xs font-medium truncate", destination.text ? "text-slate-900" : "text-slate-300")}
                >
                  {destination.text || "Where to?"}
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
            {(() => {
              const baseDates = [0, 1, 2].map((d) => addDays(new Date(), d));
              const isSelectedOutside = !baseDates.some((d) => isSameDay(selectedDate, d));
              const displayDates = isSelectedOutside ? [...baseDates, selectedDate] : baseDates;

              return displayDates.map((date, idx) => {
                const daysDiff = Math.floor((date.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
                const isToday = daysDiff === 0;
                const label = isToday ? "Today" : format(date, "do MMM");
                const isSelected = isSameDay(selectedDate, date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap shadow-sm",
                      isSelected
                        ? "border-blue-600 bg-white text-slate-800"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
                    )}
                  >
                    {isSelected && isToday && <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/10" />}
                    {label}
                  </button>
                );
              });
            })()}
            <div className="ml-auto p-1 sticky right-0 bg-white relative">
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split("-").map(Number);
                    setSelectedDate(new Date(year, month - 1, day));
                  }
                }}
                min={format(new Date(), "yyyy-MM-dd")}
              />
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="w-full h-14 bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-bold rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Search Buses
          </button>

          <button
            onClick={() => (window as any).onViewBookings?.()}
            className="w-full h-12 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-2xl border-2 border-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            View My Bookings
          </button>

          <div className="flex-1" />
        </Card>

        {/* Info Text / Placeholder for height utilization */}
        <div className="mt-auto pt-8 px-4 text-center">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em]">Reliable Inter-State Travel</p>
        </div>
      </div>
    </div>
  );
}
