import { Grid } from "lucide-react";
import { Bus } from "@/types";
import { LayoutPreviewGrid } from "../LayoutPreviewGrid";

interface BusSeatingLayoutProps {
  bus: Bus;
}

export const BusSeatingLayout = ({ bus }: BusSeatingLayoutProps) => {
  const { layout } = bus;

  return (
    <div className="dashboard-card p-6 flex flex-col h-[calc(100vh-320px)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Grid className="h-5 w-5 text-primary" /> Seating Arrangement
        </h3>
        {layout && (
          <div className="text-sm text-muted-foreground">
            {layout.totalSeats || bus.seatCapacity} seats • {layout.totalRows} rows × {layout.totalColumns} columns
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/10 rounded-lg border-2 border-dashed border-border/40 p-8">
        <div className="flex justify-center min-h-full">
          {layout ? (
            <LayoutPreviewGrid layout={layout} />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <Grid className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm font-medium italic">No layout configuration assigned to this bus</p>
              <p className="text-xs mt-1">Visit the "Edit Profile" to assign a bus layout</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
