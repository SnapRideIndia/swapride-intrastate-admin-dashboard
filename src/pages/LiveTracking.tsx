import { useState, useEffect } from "react";
import { MapPin, Bus, Users, RefreshCw, Navigation } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tripsApi } from "@/features/trips/api/trips-api";
import { useRoutes } from "@/features/routes";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Trip } from "@/types";

interface BusLocation {
  id: string;
  busNumber: string;
  driverName: string;
  routeName: string;
  routeId: string;
  currentLocation: {
    lat: number;
    lng: number;
    name: string;
  };
  nextStop: string;
  eta: string;
  status: "moving" | "stopped" | "delayed";
  passengers: number;
  speed: number;
  tripStatus: "On Time" | "Delayed" | "Early";
  delayMinutes: number;
}

// Mock bus locations - in real app would come from GPS
const generateMockLocations = (activeTrips: Trip[]): BusLocation[] => {
  // If no active trips, use some mock defaults or return empty
  if (activeTrips.length === 0) return [];

  return activeTrips.map((trip) => ({
    id: trip.busId,
    busNumber: trip.busNumber,
    driverName: trip.driverName,
    routeName: trip.routeName,
    routeId: trip.routeId,
    currentLocation: {
      lat: 17.0 + Math.random() * 0.5,
      lng: 78.0 + Math.random() * 0.5,
      name: "En Route",
    },
    nextStop: "Next Stop",
    eta: "15 min",
    status: trip.status === "In Progress" ? "moving" : "stopped",
    passengers: trip.totalPassengers,
    speed: trip.status === "In Progress" ? 60 : 0,
    tripStatus: trip.tripStatus,
    delayMinutes: trip.delayMinutes,
  }));
};

const LiveTracking = () => {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: routes = [], isLoading: isRoutesLoading } = useRoutes();

  const { data: trips = [], isLoading: isTripsLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: tripsApi.getAll,
  });

  useEffect(() => {
    if (trips.length > 0) {
      const activeTrips = trips.filter((t) => t.status === "In Progress" || t.status === "Scheduled"); // including scheduled for demo
      setBusLocations(generateMockLocations(activeTrips));
    }
  }, [trips]);

  const refreshLocations = () => {
    // Simulate GPS update with small position changes
    setBusLocations((prev) =>
      prev.map((bus) => ({
        ...bus,
        currentLocation: {
          ...bus.currentLocation,
          lat: bus.currentLocation.lat + (Math.random() - 0.5) * 0.01,
          lng: bus.currentLocation.lng + (Math.random() - 0.5) * 0.01,
        },
        speed: bus.status === "moving" ? Math.floor(Math.random() * 20) + 50 : 0,
      })),
    );
    setLastUpdated(new Date());
  };

  const filteredBuses = busLocations.filter((bus) => {
    const matchesRoute = routeFilter === "all" || bus.routeId === routeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "ontime" && bus.tripStatus !== "Delayed") ||
      (statusFilter === "delayed" && bus.tripStatus === "Delayed");
    return matchesRoute && matchesStatus;
  });

  const selectedBusData = selectedBus ? busLocations.find((b) => b.id === selectedBus) : null;

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
      <FullPageLoader show={isRoutesLoading} label="Loading tracking data..." />
      <PageHeader
        title="Live Tracking"
        subtitle={`Track ${busLocations.length} active buses in real-time`}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button variant="outline" size="sm" onClick={refreshLocations}>
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
              <SelectItem value="ontime">On Time</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="dashboard-card p-6 h-[600px] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Interactive Map</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                  In production, this would display a Leaflet or Google Maps view with real-time bus positions, routes,
                  and stops.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  {filteredBuses.map((bus) => (
                    <button
                      key={bus.id}
                      onClick={() => setSelectedBus(bus.id)}
                      className={cn(
                        "p-3 rounded-lg border transition-all text-left",
                        selectedBus === bus.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", getStatusColor(bus.status))} />
                        <span className="text-sm font-medium">{bus.busNumber}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{bus.currentLocation.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bus List / Details Panel */}
        <div className="space-y-4">
          {selectedBusData ? (
            <div className="dashboard-card p-5">
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
                  <span className={getTripStatusBadge(selectedBusData.tripStatus)}>
                    {selectedBusData.tripStatus}
                    {selectedBusData.delayMinutes > 0 && ` (+${selectedBusData.delayMinutes} min)`}
                  </span>
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
                  <p className="text-sm font-medium">{selectedBusData.currentLocation.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedBusData.currentLocation.lat.toFixed(4)}, {selectedBusData.currentLocation.lng.toFixed(4)}
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
                  <span className="text-sm">{selectedBusData.passengers} passengers</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-card p-4">
              <h3 className="font-semibold mb-3">Active Buses</h3>
              <div className="space-y-2">
                {filteredBuses.map((bus) => (
                  <button
                    key={bus.id}
                    onClick={() => setSelectedBus(bus.id)}
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
                        {bus.currentLocation.name}
                      </div>
                      <span className={cn("text-xs px-2 py-0.5 rounded", getTripStatusBadge(bus.tripStatus))}>
                        {bus.tripStatus}
                      </span>
                    </div>
                  </button>
                ))}
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
                  <span className="text-sm">On Time</span>
                </div>
                <span className="font-medium">{busLocations.filter((b) => b.tripStatus !== "Delayed").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-sm">Delayed</span>
                </div>
                <span className="font-medium">{busLocations.filter((b) => b.tripStatus === "Delayed").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Passengers</span>
                </div>
                <span className="font-medium">{busLocations.reduce((sum, b) => sum + b.passengers, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveTracking;
