import { MapPin, Navigation, Bus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLiveLocations, FleetMap } from "@/features/trips";
import { useJsApiLoader } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const MAP_LIBRARIES: ("geometry" | "drawing" | "places" | "visualization")[] = ["geometry"];

export function LiveBusTracker() {
  const navigate = useNavigate();
  const { data: activeBuses = [], isLoading } = useLiveLocations();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: MAP_LIBRARIES,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select first bus when buses load
  useEffect(() => {
    if (activeBuses.length > 0 && !selectedId) {
      setSelectedId(activeBuses[0].tripId ?? activeBuses[0].id);
    }
  }, [activeBuses, selectedId]);

  if (isLoading) {
    return (
      <div className="dashboard-card h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const navigateToTracking = (tripId?: string) => {
    navigate(ROUTES.LIVE_TRACKING, { state: { tripId: tripId ?? selectedId } });
  };

  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Live Bus Tracking</h3>
            <p className="text-xs text-muted-foreground">Real-time bus locations</p>
          </div>
          <span className="badge-success flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            {activeBuses.length} Active
          </span>
        </div>
      </div>

      {/* Map or Placeholder */}
      <div className="h-48 relative overflow-hidden group">
        {activeBuses.length > 0 ? (
          <div className="cursor-pointer w-full h-full" onClick={() => navigateToTracking()}>
            <div className="grayscale-[0.1] opacity-95 w-full h-full pointer-events-none">
              {isLoaded && (
                <FleetMap
                  buses={activeBuses}
                  selectedBusId={selectedId}
                  interactive={false}
                  showStops={false}
                  showStartEnd={false}
                />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-border">
              <Navigation className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase">Live Radar</span>
            </div>
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow text-xs font-semibold text-primary flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Open Live Tracking
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center relative border-b border-border/50">
            {/* Map Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative mb-2">
              <div className="h-12 w-12 rounded-full bg-slate-200/50 flex items-center justify-center">
                <Navigation className="h-6 w-6 text-slate-400" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-slate-300 border-2 border-slate-50" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Sessions</p>
            <p className="text-[10px] text-slate-400 mt-1">Real-time tracking of intrastate buses</p>
          </div>
        )}
      </div>

      {/* Bus List */}
      <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
        {activeBuses.length > 0 ? (
          activeBuses.map((bus) => {
            const busId = bus.tripId ?? bus.id;
            const isSelected = selectedId === busId;
            return (
              <div
                key={bus.id}
                className={cn(
                  "p-4 transition-colors cursor-pointer select-none",
                  isSelected
                    ? "bg-primary/5 border-l-2 border-primary"
                    : "hover:bg-muted/50 border-l-2 border-transparent",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(busId);
                }}
                onDoubleClick={() => navigateToTracking(busId)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-primary text-white" : "bg-primary-100 text-primary",
                      )}
                    >
                      <Bus className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{bus.busNumber}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{bus.routeName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Driver: {bus.driverName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col items-end gap-1 mb-1">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                          bus.status === "moving" ? "badge-success" : "badge-warning",
                        )}
                      >
                        {bus.status === "moving" ? "On Route" : "At Stop"}
                      </span>
                      {bus.eta && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-100 text-blue-700">
                          ETA: {bus.eta}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {bus.occupiedSeats}/{bus.totalSeats ?? "-"} seats
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {bus.lastUpdatedAt ? `${formatDistanceToNow(new Date(bus.lastUpdatedAt))} ago` : "Just now"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No active buses currently</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {activeBuses.length > 0 && (
        <div className="p-3 border-t border-border">
          <button
            className="w-full text-xs text-primary font-medium hover:underline flex items-center justify-center gap-1"
            onClick={() => navigateToTracking()}
          >
            <MapPin className="h-3 w-3" />
            Open full Live Tracking
          </button>
        </div>
      )}
    </div>
  );
}
