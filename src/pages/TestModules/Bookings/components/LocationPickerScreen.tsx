import { ChevronLeft, X, Search, Navigation, Home as HomeIcon, Briefcase, History, Loader2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLocation } from "../../types";
import { savedLocationsApi, SavedLocation, RecentSearch } from "../api/saved-locations";
import { useState, useEffect } from "react";
import { searchApi } from "../api/search";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LocationPickerScreenProps {
  pickingType: "source" | "destination";
  onBack: () => void;
  onSelect: (loc: AppLocation) => void;
  savedLocations?: SavedLocation[];
  recentSearches?: RecentSearch[];
  /** When set, picker is in "edit location" mode: select triggers update instead of onSelect for search */
  editingLocation?: SavedLocation | null;
  onUpdateLocation?: (id: string, loc: { address: string; latitude: number; longitude: number }) => void;
  onSavedLocationCreated?: () => void;
}

export function LocationPickerScreen({
  pickingType,
  onBack,
  onSelect,
  savedLocations = [],
  recentSearches = [],
  editingLocation = null,
  onUpdateLocation,
  onSavedLocationCreated,
}: LocationPickerScreenProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsLabel, setSaveAsLabel] = useState("");
  const [saveAsTarget, setSaveAsTarget] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [saving, setSaving] = useState(false);

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
    const loc: AppLocation = {
      text: s.mainText || s.text,
      lat: s.lat,
      lng: s.lng,
      address: s.text,
      placeName: s.mainText || undefined,
    };
    if (editingLocation && onUpdateLocation) {
      onUpdateLocation(editingLocation.id, {
        address: loc.text || s.text,
        latitude: s.lat,
        longitude: s.lng,
      });
      onBack();
      return;
    }
    onSelect(loc);
  };

  const openSaveAs = (search: RecentSearch, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveAsTarget({
      address: search.address,
      latitude: search.latitude,
      longitude: search.longitude,
    });
    setSaveAsLabel("");
    setSaveAsOpen(true);
  };

  const handleSaveAs = async () => {
    if (!saveAsTarget || !saveAsLabel.trim()) return;
    setSaving(true);
    try {
      await savedLocationsApi.create({
        label: saveAsLabel.trim(),
        address: saveAsTarget.address,
        latitude: saveAsTarget.latitude,
        longitude: saveAsTarget.longitude,
      });
      setSaveAsOpen(false);
      setSaveAsTarget(null);
      onSavedLocationCreated?.();
    } finally {
      setSaving(false);
    }
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
          {editingLocation ? "Edit location" : `Search ${pickingType === "source" ? "Pickup" : "Dropoff"} Address`}
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
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                {pickingType === "source" ? "Home" : "Office"}
              </h4>
              <div className="space-y-1">
                {(() => {
                  const filtered = savedLocations.filter((addr) => {
                    const n = addr.label.toLowerCase();
                    return pickingType === "source" ? n === "home" : n === "office" || n === "work";
                  });
                  return filtered.length > 0 ? (
                    filtered.map((addr, idx) => (
                      <button
                        key={idx}
                        className="flex items-center gap-3 w-full p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-left group active:scale-[0.98]"
                        onClick={() =>
                          onSelect({
                            text: addr.label,
                            address: addr.address,
                            placeName: addr.label,
                            lat: addr.latitude,
                            lng: addr.longitude,
                          })
                        }
                      >
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors border border-slate-100">
                          {pickingType === "source" ? (
                            <HomeIcon className="h-3.5 w-3.5 text-blue-500" />
                          ) : (
                            <Briefcase className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 capitalize">{addr.label}</p>
                          <p className="text-[10px] text-slate-500 truncate">{addr.address}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 italic px-1">
                      No {pickingType === "source" ? "home" : "office"} address saved
                    </p>
                  );
                })()}
              </div>
            </div>

            <div className="h-px bg-slate-50 mx-1" />

            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Recent {pickingType === "source" ? "Pickup" : "Dropoff"} Locations
              </h4>
              <div className="space-y-1">
                {(() => {
                  const filtered = recentSearches;
                  return filtered.length > 0 ? (
                    filtered.map((search, idx) => {
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 w-full p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all group"
                        >
                          <button
                            className="flex items-center gap-3 flex-1 min-w-0 text-left active:scale-[0.98]"
                            onClick={() =>
                              onSelect({
                                text: search.place_name || search.address,
                                placeName: search.place_name ?? undefined,
                                address: search.address,
                                lat: search.latitude,
                                lng: search.longitude,
                              })
                            }
                          >
                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors border border-slate-100">
                              <History className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {search.place_name || search.address}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {search.place_name ? search.address : new Date(search.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-lg shrink-0 ${
                              search.is_saved
                                ? "text-primary bg-primary/10"
                                : "text-slate-400 hover:text-primary hover:bg-primary/10"
                            }`}
                            title={search.is_saved ? "Saved" : "Save as location"}
                            onClick={(e) => !search.is_saved && openSaveAs(search, e)}
                            disabled={!!search.is_saved}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${search.is_saved ? "fill-primary" : ""}`}
                            />
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-slate-400 italic px-1">No recent searches</p>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={saveAsOpen} onOpenChange={(open) => !open && setSaveAsOpen(false)}>
        <DialogContent className="rounded-3xl max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Save as</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm text-slate-700 truncate">{saveAsTarget?.address}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                Save as
              </label>
              <Input
                placeholder="e.g. Home, Office, Gym"
                value={saveAsLabel}
                onChange={(e) => setSaveAsLabel(e.target.value)}
                className="rounded-xl"
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSaveAsOpen(false)} disabled={saving} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSaveAs}
              disabled={saving || !saveAsLabel.trim()}
              className="rounded-xl"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
