import { ChevronLeft, X, Search, Navigation, Home as HomeIcon, Briefcase, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Location } from "../../types";
import { useState, useEffect } from "react";
import { searchApi } from "../api/search";
import { useLogs } from "../../shared/LogContext";

interface LocationPickerScreenProps {
  pickingType: "source" | "destination";
  onBack: () => void;
  onSelect: (loc: Location) => void;
}

export function LocationPickerScreen({ pickingType, onBack, onSelect }: LocationPickerScreenProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addLog } = useLogs();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchApi.getPlaceSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error("Autocomplete error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (s: any) => {
    onSelect({
      text: s.mainText || s.text,
      lat: s.lat,
      lng: s.lng,
      address: s.text,
    });
  };

  return (
    <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-4 px-1">
          <Button variant="ghost" size="icon" className="rounded-full h-7 w-7" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-7 w-7" onClick={onBack}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="text-base font-black text-slate-800 tracking-tight mb-3 px-1">
          Search {pickingType === "source" ? "Pickup" : "Dropoff"} Address
        </h3>
        <div className="relative group px-1">
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5 text-slate-400" />
            )}
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search your address"
            className="pl-10 h-10 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 text-xs font-bold shadow-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 custom-scrollbar">
        {query.length >= 3 && (suggestions.length > 0 || isLoading) ? (
          <div className="space-y-1">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">Search Results</h4>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-left group active:scale-[0.98]"
                onClick={() => handleSelect(s)}
              >
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors border border-slate-100">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{s.mainText || s.text}</p>
                  <p className="text-[10px] text-slate-500 truncate">{s.text}</p>
                  <p className="text-[8px] text-slate-400 font-mono mt-0.5">
                    {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <button className="flex items-center gap-3 w-full p-2 group transition-all active:scale-[0.98]">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Navigation className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-blue-600">Use current location</span>
            </button>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Saved Addresses</h4>
              <div className="space-y-1">
                {[
                  { icon: HomeIcon, label: "Home", sub: "No.2 thimasamunthram tamilnadu - 631507" },
                  { icon: Briefcase, label: "Work", sub: "No.2 thimasamunthram tamilnadu - 631507" },
                ].map((addr, idx) => (
                  <button
                    key={idx}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-left group active:scale-[0.98]"
                    onClick={() => onSelect({ text: addr.label, lat: 12.9716, lng: 77.5946 })}
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors border border-slate-100">
                      <addr.icon className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">{addr.label}</p>
                      <p className="text-[10px] text-slate-500 truncate">{addr.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-50 mx-1" />

            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Recent Searches</h4>
              <div className="space-y-1">
                <button
                  className="flex items-center gap-3 w-full p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-left group active:scale-[0.98]"
                  onClick={() => onSelect({ text: "Lodha vesta", lat: 12.9716, lng: 77.5946 })}
                >
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors border border-slate-100">
                    <History className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">Lodha vesta</p>
                    <p className="text-[10px] text-slate-500 truncate">No.2 thimasamunthram tamilnadu - 631507</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const MapPin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
