import { ShieldCheck, RefreshCw } from "lucide-react";
import { ConditionCard } from "./shared/ConditionCard";
import { Bus } from "@/types";

interface BusConditionProps {
  bus: Bus;
}

export const BusCondition = ({ bus }: BusConditionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConditionCard title="Fitness Certificate" expiry={bus.fitnessExpiry} icon={ShieldCheck} />
        <ConditionCard title="Insurance Policy" expiry={bus.insuranceExpiry} icon={ShieldCheck} />
      </div>
      <div className="dashboard-card p-12 flex flex-col items-center justify-center text-center opacity-60">
        <div className="bg-muted p-4 rounded-full mb-4">
          <RefreshCw className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h4 className="font-bold">Maintenance History</h4>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          No recent maintenance logs or workshop history recorded for this vehicle.
        </p>
      </div>
    </div>
  );
};
