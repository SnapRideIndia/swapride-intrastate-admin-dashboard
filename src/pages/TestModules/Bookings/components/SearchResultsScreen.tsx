import {
  ChevronLeft,
  Edit2,
  Bus,
  Clock,
  ChevronRight,
  Navigation,
  Award,
  PersonStanding,
  X,
  Check,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay } from "date-fns";
import { useState } from "react";
import { Location } from "../../types";
import { SearchResult, SearchTiming, SearchStop } from "../types/search";

interface SearchResultsScreenProps {
  source: Location;
  destination: Location;
  selectedDate: Date;
  onBack: () => void;
  onProceed: (result: SearchResult, timing: SearchTiming) => void;
  onDateChange: (date: Date) => void;
  results: SearchResult[];
  isLoading: boolean;
  isReturnLeg?: boolean;
  onSwap?: () => void;
  onSearch?: () => void;
}

export function SearchResultsScreen({
  source,
  destination,
  selectedDate,
  onBack,
  onProceed,
  onDateChange,
  results,
  isLoading,
  isReturnLeg = false,
  onSwap,
  onSearch,
}: SearchResultsScreenProps) {
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [activeFullRoute, setActiveFullRoute] = useState<SearchStop[] | null>(null);
  const [activeTimings, setActiveTimings] = useState<SearchResult | null>(null);

  const dynamicDates = [0, 1, 2].map((days) => addDays(new Date(), days));
  if (!dynamicDates.some((d) => isSameDay(selectedDate, d))) {
    dynamicDates.push(selectedDate);
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden h-full">
      {/* Search Edit Popup Overlay (Image 1) */}
      {isSearchPopupOpen && (
        <div className="absolute inset-x-0 top-0 z-50 bg-white shadow-2xl rounded-b-3xl transform transition-transform duration-300 ease-out border-b border-slate-100 p-5 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900">Search Bus</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsSearchPopupOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4 mb-6 relative">
            {/* Connector Line */}
            <div className="absolute left-[5.5px] top-[26px] bottom-[26px] w-0 border-l border-dotted border-slate-300" />

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full border-2 border-[#FFC107] bg-white shrink-0 z-10" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup</p>
                <div className="text-[13px] font-medium text-slate-700 pb-1 border-b border-slate-100 truncate">
                  {source.text}
                </div>
              </div>
            </div>

            {/* Swap Button (Replicated from SearchScreen) */}
            <div className="absolute right-0 top-[26px] z-20">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-90 transition-all border-2 border-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onSwap?.();
                }}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-blue-900 shrink-0 z-10" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dropoff</p>
                <div className="text-[13px] font-medium text-slate-700 pb-1 border-b border-slate-100 truncate">
                  {destination.text}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 relative">
            {dynamicDates.map((date, i) => {
              const isSelected = isSameDay(selectedDate, date);
              const isToday = isSameDay(new Date(), date);
              const label = isToday ? "Today" : format(date, "do MMM");
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => {
                    onDateChange(date);
                    setIsSearchPopupOpen(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-[11px] font-black whitespace-nowrap border flex items-center gap-1.5 transition-all text-slate-800",
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 text-blue-600"
                      : "border-slate-200 text-slate-500 bg-white",
                  )}
                >
                  {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                  {label}
                </button>
              );
            })}
            <div className="ml-auto p-1 sticky right-0 bg-white relative">
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split("-").map(Number);
                    onDateChange(new Date(year, month - 1, day));
                    setIsSearchPopupOpen(false);
                  }
                }}
                min={format(new Date(), "yyyy-MM-dd")}
              />
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </div>

          <Button
            className="w-full h-11 bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-black text-sm rounded-xl shadow-lg"
            onClick={() => {
              setIsSearchPopupOpen(false);
              onSearch?.();
            }}
          >
            Search
          </Button>
        </div>
      )}

      {/* Full Route Overlay */}
      {activeFullRoute && (
        <div className="absolute inset-x-0 inset-y-0 z-[60] bg-white flex flex-col no-scrollbar overflow-hidden">
          <div className="bg-white px-5 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="text-[17px] font-black text-slate-900 tracking-tight">Full Route</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setActiveFullRoute(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-5">
            <div className="relative">
              <div className="absolute left-[7.5px] top-6 bottom-6 w-0 border-l border-slate-200" />

              <div className="space-y-6">
                {activeFullRoute.map((stop, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="pt-1.5 flex flex-col items-center shrink-0">
                      {stop.isUserSegment ? (
                        <div
                          className={cn(
                            "h-4 w-4 rounded-full z-10 shadow-sm",
                            i === activeFullRoute.findIndex((s) => s.isUserSegment) ? "bg-[#FFC107]" : "bg-blue-900",
                          )}
                        />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-300 bg-white z-10 flex items-center justify-center">
                          <div className="h-1 w-1 rounded-full bg-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 pb-2">
                      <p className="text-[11px] font-bold text-slate-500 mb-0.5">
                        {format(new Date(stop.arrivalTime), "h:mm a")}
                      </p>
                      <h4
                        className={cn(
                          "text-[14px] tracking-tight font-black",
                          stop.isUserSegment ? "text-slate-900" : "text-slate-600",
                        )}
                      >
                        {stop.name}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500">{stop.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Selection Popup */}
      {activeTimings && (
        <div className="absolute inset-x-0 inset-y-0 z-[70] bg-black/40 flex flex-col justify-end no-scrollbar overflow-hidden">
          <div className="bg-white rounded-t-3xl p-5 flex flex-col max-h-[80%] shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">Select a time</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setActiveTimings(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3 overflow-y-auto no-scrollbar pb-6">
              {activeTimings.timings.map((t, i) => (
                <button
                  key={t.tripId}
                  className="w-full bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all text-left"
                  onClick={() => onProceed(activeTimings, t)}
                >
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-900">
                      {format(new Date(t.pickupArrivalTime), "h:mm a")} -{" "}
                      {format(new Date(t.dropoffArrivalTime), "h:mm a")}
                    </h4>
                    <p className="text-sm font-bold text-slate-400">
                      Bus: {t.busNumber} • {t.availableSeats} Seats
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center gap-4 shrink-0 relative z-40">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black truncate max-w-[120px] tracking-tight">
              {source.text.split(",")[0]}
            </span>
            <span className="text-slate-300 text-xs">→</span>
            <span className="text-xs font-black truncate max-w-[120px] tracking-tight">
              {destination.text.split(",")[0]}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsSearchPopupOpen(true)}>
          <Edit2 className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      {/* Date Tabs */}
      <div className="bg-white px-2 py-0 border-b border-slate-100 flex gap-4 overflow-x-auto no-scrollbar shrink-0">
        {dynamicDates.map((date, i) => {
          const isSelected = isSameDay(selectedDate, date);
          const isToday = isSameDay(new Date(), date);
          const label = isToday ? "Today" : format(date, "do MMM");
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateChange(date)}
              className={cn(
                "px-4 py-2 text-[11px] font-black whitespace-nowrap transition-all border-b-2",
                isSelected ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Bus Banner */}
        <div className="bg-white rounded-2xl border border-blue-50 p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="flex-1 z-10">
            <p className="text-blue-900 text-xs font-black leading-tight">
              Showing nearest stops & bus timings on your route
            </p>
          </div>
          <div className="w-14 h-14 shrink-0 z-10">
            <img src="/bus-banner.png" alt="Bus Illustration" className="w-full h-full object-contain" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-50/50 rounded-full blur-xl" />
        </div>

        {/* Results List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400">Searching for buses...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-10">
            <Bus className="h-12 w-12 text-slate-200 mb-4" />
            <p className="text-sm font-bold text-slate-500">No buses found for this route on this date.</p>
          </div>
        ) : (
          results.map((result, idx) => (
            <ResultCard
              key={result.routeId + result.pickup.pointId}
              result={result}
              onProceed={(timing) => onProceed(result, timing)}
              onShowFullRoute={() => setActiveFullRoute(result.allStops)}
              onShowTimings={() => setActiveTimings(result)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ResultCard({
  result,
  onProceed,
  onShowFullRoute,
  onShowTimings,
}: {
  result: SearchResult;
  onProceed: (timing: SearchTiming) => void;
  onShowFullRoute: () => void;
  onShowTimings: () => void;
}) {
  const [expandedSection, setExpandedSection] = useState<"pickup" | "dropoff" | null>(null);
  const firstTiming = result.timings[0];
  const isTopPick =
    firstTiming && result.pickup.distanceText.includes("m") && !result.pickup.distanceText.includes("km");

  const toggleSection = (section: "pickup" | "dropoff") => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderStopDetails = (stop: any) => (
    <div className="space-y-4 pt-2">
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {(stop.images && stop.images.length > 0 ? stop.images : [{ imageUrl: "" }]).map((img: any, i: number) => (
          <div
            key={img.id || i}
            className="h-28 w-44 bg-slate-100 rounded-2xl shrink-0 border border-slate-200 text-slate-300 relative overflow-hidden shadow-sm"
          >
            {img.imageUrl ? (
              <img src={img.imageUrl} className="w-full h-full object-cover" alt="Stop" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <Bus className="h-10 w-10 opacity-10" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1 pb-2">
        <div className="flex-1 h-px bg-slate-100" />
        <button className="flex items-center gap-2 text-slate-900 group" onClick={onShowFullRoute}>
          <Navigation className="h-4 w-4 rotate-45" />
          <span className="text-[11px] font-black tracking-tight">View full route</span>
        </button>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-0 select-none">
      {isTopPick && (
        <div className="bg-green-800 text-white px-4 py-2.5 rounded-t-2xl flex flex-col gap-0.5 relative z-10 -mb-1 shadow-md">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-300 fill-emerald-300" />
            <span className="text-[11px] font-black uppercase tracking-widest">Top pick for you</span>
          </div>
          <p className="text-[10px] text-emerald-50/90 font-bold tracking-tight">
            Yay! Your pickup is just {result.pickup.distanceText} walk away
          </p>
        </div>
      )}

      <Card
        className={cn(
          "bg-white border-slate-200 overflow-hidden shadow-sm transition-all duration-300",
          isTopPick ? "rounded-t-none rounded-b-[2rem] border-t-0" : "rounded-[2rem]",
        )}
      >
        <div className="p-4 space-y-5">
          {/* Route Section */}
          <div className="relative pt-1">
            {/* Visual Line */}
            <div className="absolute left-[7.5px] top-8 bottom-8 w-[0px] border-l border-dotted border-slate-300" />

            <div className="space-y-8">
              {/* Pickup Point */}
              <div className="flex gap-4">
                <div className="shrink-0 z-10 pt-1">
                  <div className="bg-[#FFC107] text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm whitespace-nowrap min-w-[58px] text-center uppercase tracking-tighter">
                    {firstTiming ? format(new Date(firstTiming.pickupArrivalTime), "h:mm a") : "--"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[14px] font-black text-slate-900 tracking-tight leading-tight">
                      {result.pickup.name}
                    </h4>
                  </div>
                  <p className="text-[12px] font-bold text-slate-500 mb-2.5 leading-snug">{result.pickup.address}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                        <PersonStanding className="h-4 w-4 text-slate-900" />
                        {result.pickup.distanceText} walk
                      </span>
                      <button
                        className="flex items-center gap-1 px-1 py-0.5 rounded transition-colors"
                        onClick={() => toggleSection("pickup")}
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform text-slate-400",
                            expandedSection === "pickup" && "rotate-90 text-slate-900",
                          )}
                        />
                      </button>
                    </div>

                    <button className="text-[11px] font-black text-blue-600 flex items-center gap-1 uppercase tracking-tight hover:text-blue-700">
                      <Navigation className="h-3.5 w-3.5 fill-blue-600/10" /> Direction
                    </button>
                  </div>

                  {expandedSection === "pickup" && renderStopDetails(result.pickup)}
                </div>
              </div>

              {/* Dropoff Point */}
              <div className="flex gap-4">
                <div className="shrink-0 z-10 pt-1">
                  <div className="bg-[#FFC107] text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm whitespace-nowrap min-w-[58px] text-center uppercase tracking-tighter">
                    {firstTiming ? format(new Date(firstTiming.dropoffArrivalTime), "h:mm a") : "--"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[14px] font-black text-slate-900 tracking-tight leading-tight">
                      {result.dropoff.name}
                    </h4>
                  </div>
                  <p className="text-[12px] font-bold text-slate-500 mb-2.5 leading-snug">{result.dropoff.address}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                        <PersonStanding className="h-4 w-4 text-slate-900" />
                        {result.dropoff.distanceText} walk
                      </span>
                      <button
                        className="flex items-center gap-1 px-1 py-0.5 rounded transition-colors"
                        onClick={() => toggleSection("dropoff")}
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform text-slate-400",
                            expandedSection === "dropoff" && "rotate-90 text-slate-900",
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {expandedSection === "dropoff" && renderStopDetails(result.dropoff)}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-50 mx-2" />

          {/* Timings Section */}
          <div className="space-y-4 pt-1">
            <h5 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Bus Timings</h5>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-1">
              {result.timings.slice(0, 3).map((t, i) => (
                <button
                  key={t.tripId}
                  onClick={() => onProceed(t)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border min-w-[90px] transition-all",
                    i === 0
                      ? "border-[#FFC107] bg-[#FFC107]/5 shadow-sm ring-1 ring-[#FFC107]/20"
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-50",
                  )}
                >
                  <div className="flex flex-col items-center gap-1 relative py-1 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                    <div className="w-0.5 h-3 bg-slate-200" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                  </div>
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[12px] font-black text-slate-900 leading-none tracking-tight">
                      {format(new Date(t.pickupArrivalTime), "h:mm a")}
                    </span>
                    <span className="text-[12px] font-black text-slate-900 leading-none tracking-tight">
                      {format(new Date(t.dropoffArrivalTime), "h:mm a")}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 pb-1 px-1">
              <button
                className="text-[13px] font-black text-blue-600 flex items-center gap-2 group tracking-tight"
                onClick={onShowTimings}
              >
                <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors shadow-sm">
                  <Clock className="h-4 w-4" />
                </div>
                View all {result.timings.length} timings
              </button>
              <div className="flex flex-col items-end gap-1.5">
                <Button
                  className="bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-black text-[15px] h-12 px-10 rounded-2xl shadow-lg shadow-amber-200/50 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProceed(firstTiming);
                  }}
                >
                  Proceed
                </Button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Fares starting from ₹{result.baseFare}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
