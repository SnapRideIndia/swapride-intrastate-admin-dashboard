import { useState } from "react";
import {
  ChevronLeft,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Search,
  Home,
  Building2,
  Clock,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { addDays, format, isSameDay } from "date-fns";
import { AppLocation } from "../../types";
import { SavedLocation, RecentSearch } from "../api/saved-locations";

interface SearchScreenProps {
  source: AppLocation;
  setSource: (loc: AppLocation) => void;
  destination: AppLocation;
  setDestination: (loc: AppLocation) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onBack: () => void;
  onSearch: (startTime: string, endTime: string) => void;
  onOpenPicker: (type: "source" | "destination") => void;
  isOnboarded?: boolean;
  savedLocations?: SavedLocation[];
  recentSearches?: RecentSearch[];
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
  isOnboarded = true,
  savedLocations = [],
  recentSearches = [],
}: SearchScreenProps) {
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("06:00 PM");

  console.log("SearchScreen Props:", { savedLocations, recentSearches });
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-slate-50" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 text-slate-800" />
        </Button>
      </div>

      <div className="flex-1 px-4 pb-6">
        {!isOnboarded && (
          <div className="mb-6 px-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Tell us about your commute !</h2>
          </div>
        )}

        <Card className="p-5 rounded-3xl border border-slate-100 shadow-sm bg-white relative space-y-4 flex flex-col">
          {/* Visual Route Connector */}
          <div className="absolute left-[25px] top-[48px] h-[58px] w-[1px] border-l border-dashed border-slate-300 z-0" />

          <div className="space-y-4 relative z-10">
            {/* Pickup */}
            <div className="flex items-start gap-4 cursor-pointer group" onClick={() => onOpenPicker("source")}>
              <div className="mt-1.5 h-6 w-6 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-slate-100 transition-colors">
                {isOnboarded ? (
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                ) : (
                  <Home className="h-3.5 w-3.5 text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0 border-b border-slate-100 pb-3 group-hover:border-slate-200 transition-colors">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {isOnboarded ? "Pickup" : "Where do you live?"}
                </label>
                <p className={cn("text-xs font-medium truncate", source.text ? "text-slate-900" : "text-slate-300")}>
                  {source.text || (isOnboarded ? "Where from?" : "E.g. Sunshine homes")}
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
              <div className="mt-1.5 h-6 w-6 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-slate-100 transition-colors">
                {isOnboarded ? (
                  <div className="h-2 w-2 rounded-full bg-blue-900" />
                ) : (
                  <Building2 className="h-3.5 w-3.5 text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0 border-b border-slate-100 pb-3 group-hover:border-slate-200 transition-colors">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {isOnboarded ? "Dropoff" : "Where do you work?"}
                </label>
                <p
                  className={cn("text-xs font-medium truncate", destination.text ? "text-slate-900" : "text-slate-300")}
                >
                  {destination.text || (isOnboarded ? "Where to?" : "E.g. Lodha Vesta, xxxxx")}
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection / Office Timing */}
          {isOnboarded ? (
            <div className="flex items-center gap-2 pt-2 overflow-x-auto scrollbar-hide">
              {(() => {
                const baseDates = [0, 1, 2].map((d) => addDays(new Date(), d));
                const isSelectedOutside = !baseDates.some((d) => isSameDay(selectedDate, d));
                const displayDates = isSelectedOutside ? [...baseDates, selectedDate] : baseDates;

                return displayDates.map((date, idx) => {
                  const daysDiff = Math.floor(
                    (date.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
                  );
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
          ) : (
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Office Timing</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">From</span>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase">to</span>
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">To</span>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={() => onSearch(startTime, endTime)}
            className="w-full h-14 bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-bold rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
          >
            {isOnboarded ? (
              <>
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Search Buses
              </>
            ) : (
              "Submit"
            )}
          </button>

          {isOnboarded && (
            <button
              onClick={() => (window as any).onViewBookings?.()}
              className="w-full h-12 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-2xl border-2 border-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              <History className="w-4 h-4" />
              View My Bookings
            </button>
          )}
        </Card>

        {/* Info Text / Placeholder for height utilization */}
        <div className="mt-12 mb-8 px-4 text-center">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em]">Reliable Inter-State Travel</p>
        </div>
      </div>
    </div>
  );
}
