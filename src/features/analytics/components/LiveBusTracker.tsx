import { MapPin, Navigation } from "lucide-react";

const activeBuses = [
  {
    id: "TS07-1234",
    route: "Mehboobnagar → Hyderabad",
    driver: "Ramesh Kumar",
    status: "On Route",
    passengers: 42,
    capacity: 52,
    lastUpdate: "2 min ago",
  },
  {
    id: "TS07-5678",
    route: "Hyderabad → Mehboobnagar",
    driver: "Suresh Reddy",
    status: "At Stop",
    passengers: 38,
    capacity: 52,
    lastUpdate: "1 min ago",
  },
  {
    id: "TS07-9012",
    route: "Mehboobnagar → Hyderabad",
    driver: "Venkat Rao",
    status: "On Route",
    passengers: 48,
    capacity: 52,
    lastUpdate: "30 sec ago",
  },
  {
    id: "TS07-3456",
    route: "Hyderabad → Mehboobnagar",
    driver: "Krishna Murthy",
    status: "Starting",
    passengers: 25,
    capacity: 52,
    lastUpdate: "Just now",
  },
];

export function LiveBusTracker() {
  return (
    <div className="dashboard-card">
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

      {/* Map placeholder */}
      <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(218, 79%, 42%)" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative flex items-center gap-2 text-primary">
          <Navigation className="h-5 w-5" />
          <span className="text-sm font-medium">GPS Map View</span>
        </div>
        {/* Bus markers */}
        <div className="absolute top-8 left-12 h-3 w-3 rounded-full bg-primary animate-pulse" />
        <div className="absolute top-16 right-20 h-3 w-3 rounded-full bg-primary animate-pulse" />
        <div className="absolute bottom-12 left-1/3 h-3 w-3 rounded-full bg-primary animate-pulse" />
        <div className="absolute bottom-8 right-1/4 h-3 w-3 rounded-full bg-success animate-pulse" />
      </div>

      {/* Bus list */}
      <div className="divide-y divide-border">
        {activeBuses.map((bus) => (
          <div key={bus.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{bus.id}</p>
                  <p className="text-xs text-muted-foreground">{bus.route}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Driver: {bus.driver}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={
                    bus.status === "On Route"
                      ? "badge-success"
                      : bus.status === "At Stop"
                        ? "badge-info"
                        : "badge-warning"
                  }
                >
                  {bus.status}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {bus.passengers}/{bus.capacity} seats
                </p>
                <p className="text-2xs text-muted-foreground">{bus.lastUpdate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
