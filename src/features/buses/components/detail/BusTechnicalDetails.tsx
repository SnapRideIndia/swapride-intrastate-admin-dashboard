import { Info, Settings, Bus as BusIcon, Zap, CheckCircle2, Calendar, MapPin } from "lucide-react";
import { InfoItem } from "./shared/InfoItem";
import { Bus } from "@/types";

interface BusTechnicalDetailsProps {
  bus: Bus;
}

export const BusTechnicalDetails = ({ bus }: BusTechnicalDetailsProps) => {
  return (
    <div className="dashboard-card p-6">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" /> Technical Specifications
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <InfoItem label="Engine / Make" value={bus.make || "Not specified"} icon={Settings} />
        <InfoItem label="Model Name" value={bus.model || "Not specified"} icon={BusIcon} />
        <InfoItem label="Fuel Type" value={bus.fuelType || "Not specified"} icon={Zap} />
        <InfoItem label="Seating Layout" value={bus.layout?.name || "None Assigned"} icon={CheckCircle2} />
        <InfoItem
          label="Purchase Date"
          value={bus.createdAt ? new Date(bus.createdAt).toLocaleDateString() : "N/A"}
          icon={Calendar}
        />
        <InfoItem label="Current Route" value={bus.currentRoute || "None Assigned"} icon={MapPin} />
      </div>
    </div>
  );
};
