import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Bus, Users, RefreshCw, Navigation, MapPin, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FleetMap, useLiveLocations } from "@/features/trips";
import { useRoutes } from "@/features/routes";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useJsApiLoader } from "@react-google-maps/api";
import { useSocket } from "@/providers/SocketContext";
import { Badge } from "@/components/ui/badge";
import { LiveLocation } from "@/types";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const MAP_LIBRARIES: ("geometry" | "drawing" | "places" | "visualization")[] = ["geometry"];

interface LocationState {
  tripId?: string;
}

const LiveTracking = () => {
  const location = useLocation();
  const initialTripId = (location.state as LocationState)?.tripId ?? null;
  const [selectedBus, setSelectedBus] = useState<string | null>(initialTripId);
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const queryClient = useQueryClient();
  const { socketService } = useSocket();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES,
  });

  const { data: routes = [], isLoading: isRoutesLoading } = useRoutes();

  const { data: liveLocations = [], isLoading: isLiveLoading, refetch } = useLiveLocations();

  // WebSocket Integration
  useEffect(() => {
    if (liveLocations) {
      setLastUpdated(new Date());
    }
  }, [liveLocations]);

  useEffect(() => {
    socketService.joinRoom("admin_dashboard");
    const unsubscribe = socketService.on("location_update", (update: Partial<LiveLocation>) => {
      queryClient.setQueryData(["trips", "live-locations"], (old: LiveLocation[] = []) => {
        const index = old.findIndex((loc) => loc.tripId === update.tripId);
        if (index > -1) {
          const newState = [...old];
          newState[index] = {
            ...newState[index],
            ...update,
            // Preserve enriched metadata from initial fetch
            busNumber: newState[index].busNumber,
            routeName: newState[index].routeName,
            driverName: newState[index].driverName,
            routePoints: newState[index].routePoints,
            encodedPolyline: update.encodedPolyline || newState[index].encodedPolyline,
            tripStatus: update.tripStatus || newState[index].tripStatus,
            delayMinutes: update.delayMinutes ?? newState[index].delayMinutes,
            nextStop: update.nextStop || newState[index].nextStop,
            eta: update.eta || newState[index].eta,
            currentLocationName: update.currentLocationName || newState[index].currentLocationName,
            occupiedSeats: update.occupiedSeats ?? newState[index].occupiedSeats,
            totalSeats: update.totalSeats ?? newState[index].totalSeats,
          } as LiveLocation;
          return newState;
        }
        return old;
      });
      setLastUpdated(new Date());
    });
    return () => {
      socketService.leaveRoom("admin_dashboard");
      unsubscribe();
    };
  }, [socketService, queryClient]);

  const filteredBuses = useMemo(() => {
    return liveLocations.filter((bus: LiveLocation) => {
      const matchesRoute = routeFilter === "all" || bus.routeId === routeFilter;
      const busSpeed = Number(bus.speed || 0);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "moving" && busSpeed > 0) ||
        (statusFilter === "stopped" && busSpeed === 0);
      return matchesRoute && matchesStatus;
    });
  }, [liveLocations, routeFilter, statusFilter]);

  const selectedBusData = useMemo(() => {
    return selectedBus ? liveLocations.find((b: LiveLocation) => b.tripId === selectedBus) || null : null;
  }, [selectedBus, liveLocations]);

  // Naming consistency for FleetMap
  const selectedBusId = selectedBus;
  const onBusClick = (bus: LiveLocation) => setSelectedBus(bus.tripId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "moving":
        return "bg-success";
      case "stopped":
        return "bg-warning";
      case "delayed":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const getTripStatusBadge = (tripStatus: string) => {
    switch (tripStatus) {
      case "On Time":
        return "badge-success";
      case "Delayed":
        return "badge-error";
      case "Early":
        return "badge-info";
      default:
        return "badge-info";
    }
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isRoutesLoading || isLiveLoading} label="Initializing Fleet Radar..." />
      <PageHeader
        title="Live Tracking"
        subtitle={`Track ${liveLocations.length} active buses in real-time`}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="shadow-sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="Filter by route" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routes</SelectItem>
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.routeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="moving">Moving</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="dashboard-card p-0 h-[600px] relative overflow-hidden">
            {!selectedBus ? (
              <div className="absolute inset-0 bg-white flex items-center justify-center z-10 animate-in fade-in duration-500">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                    <MapPin className="h-20 w-20 text-primary relative z-10 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Fleet Radar Ready</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-3">
                    Select an active shuttle from the list to begin high-precision road tracking and real-time telemetry
                    monitoring.
                  </p>
                </div>
              </div>
            ) : isLoaded ? (
              <FleetMap
                buses={liveLocations}
                selectedBusId={selectedBus}
                onBusClick={(bus) => setSelectedBus(bus.tripId)}
                showStops={true}
                showStartEnd={true}
              />
            ) : (
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Bus List / Details Panel - RESTORED ORIGINAL LAYOUT */}
        <div className="space-y-4">
          {selectedBusData ? (
            <div className="dashboard-card p-5 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{selectedBusData.busNumber}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedBus(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn("h-3 w-3 rounded-full", getStatusColor(selectedBusData.status))} />
                  <span className="text-sm capitalize">{selectedBusData.status}</span>
                  <Badge className={getTripStatusBadge(selectedBusData.tripStatus)}>
                    {selectedBusData.tripStatus}
                    {selectedBusData.delayMinutes > 0 && ` (+${selectedBusData.delayMinutes} min)`}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Route</p>
                  <p className="text-sm font-medium">{selectedBusData.routeName}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Driver</p>
                  <p className="text-sm font-medium">{selectedBusData.driverName}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Current Location</p>
                  <p className="text-sm font-medium">{selectedBusData.currentLocationName}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(selectedBusData.latitude).toFixed(4)}, {Number(selectedBusData.longitude).toFixed(4)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Next Stop</p>
                    <p className="text-sm font-medium">{selectedBusData.nextStop}</p>
                    <p className="text-xs text-muted-foreground">ETA: {selectedBusData.eta}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Speed</p>
                    <p className="text-sm font-medium">{selectedBusData.speed} km/h</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedBusData.occupiedSeats} passengers onboard</span>
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={() => setSelectedBus(null)}>
                  Back to Fleet List
                </Button>
              </div>
            </div>
          ) : (
            <div className="dashboard-card p-4">
              <h3 className="font-semibold mb-3">Active Buses</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredBuses.length > 0 ? (
                  filteredBuses.map((bus) => (
                    <button
                      key={bus.tripId}
                      onClick={() => setSelectedBus(bus.tripId)}
                      className="w-full p-3 rounded-lg border border-border hover:border-primary/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-primary" />
                          <span className="font-medium">{bus.busNumber}</span>
                        </div>
                        <div className={cn("h-2 w-2 rounded-full", getStatusColor(bus.status))} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{bus.routeName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Navigation className="h-3 w-3" />
                          {bus.currentLocationName}
                        </div>
                        <Badge className={cn("text-[10px] py-0", getTripStatusBadge(bus.tripStatus))}>
                          {bus.tripStatus}
                        </Badge>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-50">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-xs">No active units</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="dashboard-card p-4">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm font-medium">On Time</span>
                </div>
                <span className="font-bold">{liveLocations.filter((b) => b.tripStatus !== "Delayed").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-sm font-medium">Delayed</span>
                </div>
                <span className="font-bold">{liveLocations.filter((b) => b.tripStatus === "Delayed").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Passengers</span>
                </div>
                <span className="font-bold">{liveLocations.reduce((sum, b) => sum + (b.occupiedSeats || 0), 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveTracking;
