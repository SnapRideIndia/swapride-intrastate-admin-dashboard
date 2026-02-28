import { Bus as BusIcon, Zap, MapPin, ShieldCheck, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bus } from "@/types";

interface BusQuickOverviewProps {
  bus: Bus;
  onViewQR: () => void;
}

export const BusQuickOverview = ({ bus, onViewQR }: BusQuickOverviewProps) => {
  return (
    <div className="space-y-6">
      <div className="dashboard-card p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
          <BusIcon size={120} />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick overview</h3>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Capacity</span>
            </div>
            <span className="text-base font-bold">{bus.seatCapacity} Seats</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <MapPin className="h-4 w-4 text-info" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Registration</span>
            </div>
            <span className="text-base font-bold">{bus.registrationNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-success" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Year</span>
            </div>
            <span className="text-base font-bold">{bus.manufactureYear || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-card p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Self-Boarding</h3>
            <p className="text-xs text-muted-foreground">Ready for passenger scanning</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground mb-4">
          This bus is equipped with a unique secure QR token. Generated tokens allow passengers to board instantly
          within 500m proximity.
        </p>
        <Button variant="outline" size="sm" className="w-full bg-background font-semibold" onClick={onViewQR}>
          View QR Token
        </Button>
      </div>
    </div>
  );
};
