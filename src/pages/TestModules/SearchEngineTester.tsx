import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import {
  Search,
  ArrowRight,
  ChevronLeft,
  Navigation,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  ArrowUpDown,
  Clock,
  Loader2,
  MapPin,
  Route,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { searchApi } from "@/features/search/api/search-api";
import { toast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface Location {
  text: string;
  lat: number;
  lng: number;
}

interface SearchCardProps {
  source: Location;
  setSource: (loc: Location) => void;
  destination: Location;
  setDestination: (loc: Location) => void;
  selectedDate: Date;
  setSelectedDate: (val: Date) => void;
  onSearch: (preferredTime: string) => void;
  isLoading: boolean;
}

function LocationInput({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (val: string, loc?: Location) => void;
  placeholder: string;
  icon: any;
}) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await searchApi.getPlaceSuggestions(input);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    const timeoutId = setTimeout(() => fetchSuggestions(val), 500);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="flex gap-4 items-start relative border-b border-border pb-2 group" ref={containerRef}>
      <div
        className={cn(
          "h-4 w-4 rounded-full mt-1 shrink-0 z-10 border-2 border-background shadow-sm transition-transform group-focus-within:scale-110",
          Icon,
        )}
      />
      <div className="flex-1">
        <label className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-0.5">
          {label}
        </label>
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          className="border-none p-0 h-auto text-sm font-bold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 bg-transparent text-foreground"
          placeholder={placeholder}
        />
      </div>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <Card className="absolute left-8 right-0 top-full mt-1 z-[100] shadow-xl border border-border p-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
              <Loader2 className="h-3 w-3 animate-spin" />
              Searching locations...
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto scrollbar-hide">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors text-left group/item"
                  onClick={() => {
                    onChange(s.text, { text: s.text, lat: s.lat, lng: s.lng });
                    setShowSuggestions(false);
                  }}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{s.mainText || s.text}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.text}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function SearchCard({
  source,
  setSource,
  destination,
  setDestination,
  selectedDate,
  setSelectedDate,
  onSearch,
  isLoading,
}: SearchCardProps) {
  const [timeMode, setTimeMode] = useState<"AM" | "PM">("AM");
  const [preferredTime, setPreferredTime] = useState("09:00");

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <Card className="p-6 rounded-2xl border border-border shadow-md bg-card w-full max-w-sm shrink-0 h-fit sticky top-6">
      <div className="space-y-6">
        {/* Pickup & Dropoff Container */}
        <div className="relative space-y-4">
          <div className="absolute left-[7.5px] top-6 bottom-6 w-[1.5px] border-l-[1.5px] border-dashed border-muted-foreground/30 pointer-events-none" />

          <LocationInput
            label="Pickup Location"
            value={source.text}
            onChange={(val, loc) => (loc ? setSource(loc) : setSource({ ...source, text: val }))}
            placeholder="Search pickup point..."
            icon="bg-warning"
          />

          {/* Swap Button Positioned Relative to inputs */}
          <div className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-1/4 z-50">
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-full bg-background hover:bg-secondary border-border shadow-md text-foreground transition-all hover:rotate-180 active:scale-90"
              onClick={handleSwap}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          <LocationInput
            label="Dropoff Location"
            value={destination.text}
            onChange={(val, loc) => (loc ? setDestination(loc) : setDestination({ ...destination, text: val }))}
            placeholder="Search destination..."
            icon="bg-slate-900 dark:bg-slate-200"
          />
        </div>

        {/* Preferred Time Container */}
        <div className="flex gap-3 items-start p-4 bg-secondary/30 rounded-xl border border-border group focus-within:border-primary/50 transition-colors">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">
              Preferred Departure
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="border-none p-0 h-8 text-sm font-bold shadow-none focus-visible:ring-0 bg-transparent w-full [color-scheme:light] dark:[color-scheme:dark]"
              />
              <div className="flex gap-1 ml-auto bg-background p-1 rounded-lg border border-border shrink-0">
                {(["AM", "PM"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 px-3 text-[10px] font-extrabold rounded-md transition-all",
                      timeMode === mode
                        ? "bg-primary text-primary-foreground shadow-sm px-4"
                        : "text-muted-foreground hover:bg-secondary",
                    )}
                    onClick={() => setTimeMode(mode)}
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Departure Date Container */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block pl-1">
            Target Date
          </label>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((daysToAdd) => {
              const date = addDays(new Date(), daysToAdd);
              const label = daysToAdd === 0 ? "Today" : format(date, "EEE, do MMM");
              const isSelected = isSameDay(selectedDate, date);

              return (
                <Button
                  key={daysToAdd}
                  variant="outline"
                  className={cn(
                    "h-9 px-4 text-[11px] font-extrabold rounded-full border-border transition-all",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground shadow-md -translate-y-0.5"
                      : "bg-background text-muted-foreground hover:bg-secondary hover:border-muted-foreground/30",
                  )}
                  onClick={() => setSelectedDate(date)}
                >
                  {label}
                </Button>
              );
            })}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-9 w-9 ml-auto rounded-full border-border hover:bg-primary/5 text-primary",
                    ![0, 1, 2].some((d) => isSameDay(selectedDate, addDays(new Date(), d))) &&
                      "bg-primary text-primary-foreground",
                  )}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Final Search Action */}
        <Button
          onClick={() => onSearch(preferredTime)}
          disabled={isLoading}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-base rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-[0.97] disabled:opacity-70 gap-3"
        >
          <Search className="h-5 w-5" />
          Run Search Engine
        </Button>
      </div>
    </Card>
  );
}

export default function SearchEngineTester() {
  const [source, setSource] = useState<Location>({ text: "", lat: 0, lng: 0 });
  const [destination, setDestination] = useState<Location>({ text: "", lat: 0, lng: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [expandedPickup, setExpandedPickup] = useState<string | null>(null);
  const [expandedDropoff, setExpandedDropoff] = useState<string | null>(null);
  const [expandedModalStop, setExpandedModalStop] = useState<number | null>(null);
  const [showFullRoute, setShowFullRoute] = useState<string | null>(null);

  const openDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const handleSearch = async (preferredTime: string) => {
    // 1. Validations
    if (!source.text.trim()) {
      toast({
        title: "Pickup required",
        description: "Please select a valid pickup location.",
        variant: "destructive",
      });
      return;
    }
    if (source.lat === 0 || source.lng === 0) {
      toast({
        title: "Invalid Pickup",
        description: "Please select a location from the suggestions to get coordinates.",
        variant: "destructive",
      });
      return;
    }
    if (!destination.text.trim()) {
      toast({ title: "Dropoff required", description: "Please select a valid destination.", variant: "destructive" });
      return;
    }
    if (destination.lat === 0 || destination.lng === 0) {
      toast({
        title: "Invalid Dropoff",
        description: "Please select a location from the suggestions to get coordinates.",
        variant: "destructive",
      });
      return;
    }
    if (source.lat === destination.lat && source.lng === destination.lng) {
      toast({
        title: "Identical Locations",
        description: "Pickup and dropoff locations cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Use selectedDate object directly
      const apiDate = format(selectedDate, "yyyy-MM-dd");

      const results = await searchApi.searchTrips({
        pickupLat: source.lat,
        pickupLng: source.lng,
        dropoffLat: destination.lat,
        dropoffLng: destination.lng,
        tripDate: apiDate,
        userLat: source.lat, // Assuming user is at pickup for dev tester
        userLng: source.lng,
        preferredTime: `${preferredTime}:00`,
      });
      setSearchResults(results);

      if (results.length === 0) {
        toast({
          title: "No routes found",
          description: "Try adjusting your locations or preferred time. No routes available for this segment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "An error occurred while fetching routes. Please check your backend connection.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-search when locations or date changes
  useEffect(() => {
    // We only search if we have both locations
    if (source.lat !== 0 && destination.lat !== 0) {
      handleSearch("09:00");
    }
  }, [selectedDate, source.lat, destination.lat]);

  return (
    <DashboardLayout>
      <FullPageLoader show={isSearching} label="Broadcasting Request..." />
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row items-start gap-12">
        {/* Left Column: Config Panel */}
        <div className="w-full lg:w-fit shrink-0">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-foreground tracking-tighter mb-2">Search Engine</h2>
            <p className="text-muted-foreground font-medium">
              Test and refine the route finding algorithm in real-time.
            </p>
          </div>
          <SearchCard
            source={source}
            setSource={setSource}
            destination={destination}
            setDestination={setDestination}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onSearch={handleSearch}
            isLoading={isSearching}
          />
        </div>

        {/* Right Column: User-Facing Preview */}
        <div className="flex-1 w-full flex justify-center">
          <div className="w-full max-w-md bg-white border-x border-slate-100 min-h-[92vh] shadow-2xl rounded-t-[3rem] overflow-hidden relative flex flex-col">
            {/* Real-time Simulator Header */}
            <div className="bg-white p-6 border-b border-slate-50 sticky top-0 z-40">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-slate-50">
                  <ChevronLeft className="h-6 w-6 text-slate-800" />
                </Button>
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="text-sm font-extrabold truncate flex items-center gap-2 text-slate-800">
                    <span className="truncate">{source.text ? source.text.split(",")[0] : "Pickup"}</span>
                    <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{destination.text ? destination.text.split(",")[0] : "Dropoff"}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-slate-50 shrink-0 ml-2"
                  >
                    <Search className="h-5 w-5 text-slate-800" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-slate-100 pb-2">
                {[0, 1, 2].map((daysToAdd) => {
                  const date = addDays(new Date(), daysToAdd);
                  const label = daysToAdd === 0 ? "Today" : format(date, "EEE, do MMM");
                  const isSelected = isSameDay(selectedDate, date);

                  return (
                    <button
                      key={daysToAdd}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "whitespace-nowrap pb-4 px-2 text-[11px] font-extrabold transition-all uppercase tracking-wider border-b-2",
                        isSelected ? "border-primary text-primary" : "border-transparent text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
                {![0, 1, 2].some((d) => isSameDay(selectedDate, addDays(new Date(), d))) && (
                  <button className="whitespace-nowrap pb-4 px-2 text-[11px] font-extrabold transition-all uppercase tracking-wider border-b-2 border-primary text-primary">
                    {format(selectedDate, "do MMM")}
                  </button>
                )}
              </div>
            </div>

            {/* Simulation Feed */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 bg-slate-50/50">
              {isSearching ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Optimizing Routes...
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="space-y-4 px-4 pt-4">
                    {searchResults.map((route, rIndex) => (
                      <div
                        key={route.routeId + rIndex}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                      >
                        <Card className="rounded-2xl border-none shadow-sm bg-white mb-6 overflow-hidden">
                          <div className="p-5">
                            <div className="space-y-6 relative">
                              {/* Vertical timeline line */}
                              <div className="absolute left-[39px] top-6 bottom-6 w-[1px] border-l border-dashed border-slate-300" />

                              {/* Pickup segment */}
                              <div className="flex gap-5 relative">
                                <div className="bg-amber-100 text-amber-900 text-[10px] font-bold h-7 w-16 rounded flex items-center justify-center shrink-0">
                                  {new Date(route.timings[0]?.pickupArrivalTime)
                                    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                                    .toLowerCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-base text-slate-900 truncate tracking-tight">
                                        {route.pickup.name}
                                      </h4>
                                      <p className="text-xs text-slate-500 font-medium truncate mb-1">
                                        {route.pickup.address}
                                      </p>
                                      <div className="flex items-center gap-1 text-slate-700">
                                        <div
                                          className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 rounded py-0.5"
                                          onClick={() =>
                                            setExpandedPickup(expandedPickup === route.routeId ? null : route.routeId)
                                          }
                                        >
                                          <Navigation className="h-3 w-3" />
                                          <span className="text-xs font-bold">{route.pickup.distanceText}</span>
                                          {expandedPickup === route.routeId ? (
                                            <ChevronUp className="h-3 w-3" />
                                          ) : (
                                            <ChevronDown className="h-3 w-3" />
                                          )}
                                        </div>
                                        {expandedPickup === route.routeId && (
                                          <div
                                            className="flex items-center gap-1 ml-auto text-blue-600 font-bold text-xs cursor-pointer hover:underline"
                                            onClick={() =>
                                              openDirections(route.pickup.latitude, route.pickup.longitude)
                                            }
                                          >
                                            <Navigation className="h-3.5 w-3.5 rotate-45" />
                                            <span>Direction</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {expandedPickup === route.routeId && (
                                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {route.pickup.images && route.pickup.images.length > 0 ? (
                                          route.pickup.images.map((img: any, i: number) => (
                                            <img
                                              key={i}
                                              src={img.imageUrl}
                                              className="h-28 w-44 rounded-xl object-cover shrink-0 shadow-sm border border-slate-100"
                                              alt="stop"
                                            />
                                          ))
                                        ) : (
                                          <>
                                            <div className="h-28 w-44 rounded-xl bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                              No Image
                                            </div>
                                            <div className="h-28 w-44 rounded-xl bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                              No Image
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Central view full route button hidden when not expanded */}
                              {(expandedPickup === route.routeId || expandedDropoff === route.routeId) && (
                                <div className="relative flex justify-center py-2 z-10">
                                  <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100 -translate-y-1/2" />
                                  <button
                                    onClick={() => setShowFullRoute(route.routeId)}
                                    className="relative bg-white px-3 flex items-center gap-2 text-slate-900 font-bold text-xs hover:text-primary transition-colors"
                                  >
                                    <Route className="h-4 w-4" />
                                    <span>View full route</span>
                                  </button>
                                </div>
                              )}

                              {/* Dropoff segment */}
                              <div className="flex gap-5 relative">
                                <div className="bg-amber-100 text-amber-900 text-[10px] font-bold h-7 w-16 rounded flex items-center justify-center shrink-0">
                                  {new Date(route.timings[0]?.dropoffArrivalTime)
                                    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                                    .toLowerCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-base text-slate-900 truncate tracking-tight">
                                    {route.dropoff.name}
                                  </h4>
                                  <p className="text-xs text-slate-500 font-medium truncate mb-1">
                                    {route.dropoff.address}
                                  </p>
                                  <div className="flex items-center gap-1 text-slate-700">
                                    <div
                                      className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 rounded py-0.5"
                                      onClick={() =>
                                        setExpandedDropoff(expandedDropoff === route.routeId ? null : route.routeId)
                                      }
                                    >
                                      <Navigation className="h-3 w-3" />
                                      <span className="text-xs font-bold">{route.dropoff.distanceText}</span>
                                      {expandedDropoff === route.routeId ? (
                                        <ChevronUp className="h-3 w-3" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3" />
                                      )}
                                    </div>
                                    {expandedDropoff === route.routeId && (
                                      <div
                                        className="flex items-center gap-1 ml-auto text-blue-600 font-bold text-xs cursor-pointer hover:underline"
                                        onClick={() => openDirections(route.dropoff.latitude, route.dropoff.longitude)}
                                      >
                                        <Navigation className="h-3.5 w-3.5 rotate-45" />
                                        <span>Direction</span>
                                      </div>
                                    )}
                                  </div>

                                  {expandedDropoff === route.routeId && (
                                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {route.dropoff.images && route.dropoff.images.length > 0 ? (
                                          route.dropoff.images.map((img: any, i: number) => (
                                            <img
                                              key={i}
                                              src={img.imageUrl}
                                              className="h-28 w-44 rounded-xl object-cover shrink-0 shadow-sm border border-slate-100"
                                              alt="stop"
                                            />
                                          ))
                                        ) : (
                                          <>
                                            <div className="h-28 w-44 rounded-xl bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                              No Image
                                            </div>
                                            <div className="h-28 w-44 rounded-xl bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                              No Image
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Time Slots */}
                            <div className="mt-8 pt-4">
                              <p className="text-xs font-bold text-slate-500 mb-3 ml-1">Bus Timings</p>
                              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {route.timings.map((time: any, idx: number) => (
                                  <button
                                    key={time.tripId}
                                    className={cn(
                                      "flex flex-col gap-1 min-w-[110px] border rounded-xl p-3 transition-all text-left",
                                      idx === 0
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-slate-200 bg-white hover:border-slate-300",
                                    )}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-400" />
                                        <span className="text-xs font-bold text-slate-900">
                                          {new Date(time.pickupArrivalTime)
                                            .toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                            })
                                            .toLowerCase()}
                                        </span>
                                      </div>
                                      <div className="h-3 w-[1px] ml-1 border-l border-dashed border-slate-400" />
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                        <span className="text-xs font-bold text-slate-900">
                                          {new Date(time.dropoffArrivalTime)
                                            .toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                            })
                                            .toLowerCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Action Footer */}
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                              <button className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline underline-offset-4">
                                <Clock className="h-4 w-4" />
                                <span>View all 4 timings</span>
                              </button>
                              <div className="flex flex-col items-end">
                                <Button className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-10 h-11 rounded-xl shadow-md border-none active:scale-95 transition-all">
                                  Proceed
                                </Button>
                                <p className="text-[10px] font-bold text-slate-500 mt-1">
                                  Fares starting from ₹{route.baseFare}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-20 text-center space-y-4">
                  <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="font-extrabold text-lg text-foreground tracking-tight">Ready to simulate?</h3>
                  <p className="text-sm text-muted-foreground font-medium max-w-[240px] mx-auto">
                    Configure your test parameters on the left and dispatch the search request.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Network Path Modal */}
        {showFullRoute && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end lg:items-center justify-center p-0 lg:p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-lg h-[92vh] lg:h-auto lg:max-h-[85vh] overflow-hidden flex flex-col rounded-t-[3rem] lg:rounded-3xl border-none shadow-2xl">
              <div className="p-6 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Route className="h-3 w-3 text-primary" />
                  </div>
                  <h3 className="font-extrabold text-lg tracking-tight uppercase">Network Visualization</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-secondary"
                  onClick={() => setShowFullRoute(null)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                <div className="space-y-12 relative pb-10">
                  <div className="absolute left-[7px] top-[14px] bottom-0 w-[1px] border-l border-dashed border-slate-300" />

                  {searchResults
                    .find((r) => r.routeId === showFullRoute)
                    ?.allStops.map((stop: any, i: number) => (
                      <div key={i} className="relative pl-10 group">
                        <div
                          className={cn(
                            "absolute left-0 top-[6px] h-4 w-4 rounded-full border-4 bg-background z-10 transition-all group-hover:scale-125 shadow-sm",
                            stop.isUserSegment ? "border-primary" : "border-muted/50",
                          )}
                        />
                        <div
                          className={cn(
                            "flex flex-col p-4 rounded-2xl border transition-all cursor-pointer shadow-sm",
                            stop.isUserSegment
                              ? "bg-card border-primary/20 hover:border-primary/40 ring-1 ring-primary/5"
                              : "bg-card/50 border-border hover:bg-card",
                            expandedModalStop === i && "ring-2 ring-primary/20 border-primary/30",
                          )}
                          onClick={() => setExpandedModalStop(expandedModalStop === i ? null : i)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              {stop.isUserSegment && (
                                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 mb-1.5">
                                  User Segment
                                </Badge>
                              )}
                              <p className="font-extrabold text-sm uppercase tracking-tight text-foreground truncate">
                                {stop.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{stop.address}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                              <p className="text-[10px] font-extrabold text-primary">
                                {new Date(stop.arrivalTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                              {expandedModalStop === i ? (
                                <ChevronUp className="h-4 w-4 text-primary" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                              )}
                            </div>
                          </div>

                          {expandedModalStop === i && (
                            <div className="mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {stop.images && stop.images.length > 0 ? (
                                  stop.images.map((img: any, idx: number) => (
                                    <img
                                      key={idx}
                                      src={img.imageUrl}
                                      className="h-28 w-44 rounded-xl object-cover shrink-0 shadow-sm border border-border"
                                      alt="stop"
                                    />
                                  ))
                                ) : (
                                  <div className="h-28 w-full rounded-xl bg-secondary/50 flex flex-col items-center justify-center gap-2 border border-dashed border-border">
                                    <MapPin className="h-5 w-5 text-muted-foreground/30" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                      No images available
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div
                                  className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:underline"
                                  onClick={() => openDirections(stop.latitude, stop.longitude)}
                                >
                                  <Navigation className="h-3 w-3 rotate-45" />
                                  Direction
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[9px] font-extrabold uppercase tracking-widest hover:bg-primary/5 text-primary"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${stop.latitude}, ${stop.longitude}`);
                                    toast({ title: "Copied", description: "Coordinates copied to clipboard" });
                                  }}
                                >
                                  Copy Coordinates
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
