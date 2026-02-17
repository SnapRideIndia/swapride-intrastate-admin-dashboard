import { BusLayout, LayoutSeat } from "@/types";
import { cn } from "@/lib/utils";
import steeringWheelImg from "@/assets/images/steering-wheel.png";

interface LayoutPreviewGridProps {
  layout: BusLayout;
  selectedSeats?: string[];
  onSeatClick?: (seat: LayoutSeat) => void;
  compact?: boolean;
}

const getSeatColor = (isActive: boolean) => {
  if (!isActive) return "bg-muted border-border text-muted-foreground opacity-50";
  return "bg-primary/20 border-primary text-primary hover:bg-primary/30";
};

export function LayoutPreviewGrid({
  layout,
  selectedSeats = [],
  onSeatClick,
  compact = false,
}: LayoutPreviewGridProps) {
  // Determine grid dimensions. Row 0 is the Cabin.
  const maxRowPos = Math.max(...(layout.seats?.map((s) => s.rowPosition) || [0]), 0);
  const displayRows = Math.max(layout.totalRows, maxRowPos + 1);

  // Create grid from seats
  const grid: (LayoutSeat | null)[][] = [];
  for (let row = 0; row < displayRows; row++) {
    grid[row] = [];
    for (let col = 0; col < layout.totalColumns; col++) {
      const seat = layout.seats?.find((s) => s.rowPosition === row && s.colPosition === col);
      grid[row][col] = seat || null;
    }
  }

  const seatSize = compact ? "w-6 h-6 text-[8px]" : "w-10 h-10 text-xs";
  const gap = compact ? "gap-0.5" : "gap-1";

  return (
    <div className="flex flex-col items-center">
      {/* Bus Container */}
      <div className={cn("relative p-3 rounded-xl border-2 border-border bg-card shadow-sm", compact && "p-2")}>
        {/* Cabin Section (Inside Container) */}
        {!compact && (
          <div className="mb-4">
            <div className="flex justify-between items-end px-1 pb-2 border-b-2 border-dashed border-border/50">
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Entrance</div>
              <div className="flex flex-col items-center">
                <img src={steeringWheelImg} alt="Driver" className="w-8 h-8 object-contain opacity-80" />
                <span className="text-[8px] text-muted-foreground mt-0.5">DRIVER</span>
              </div>
            </div>
          </div>
        )}

        <div className={cn("space-y-1", compact && "space-y-0.5")}>
          {grid.map((row, rowIndex) => {
            return (
              <div key={rowIndex} className="flex flex-col">
                <div className={cn("flex items-center justify-center", gap)}>
                  {!compact && (
                    <span className="w-4 text-xs text-muted-foreground text-right mr-1">{rowIndex + 1}</span>
                  )}
                  {row.map((seat, colIndex) => {
                    return (
                      <div key={colIndex} className="flex">
                        <button
                          className={cn(
                            seatSize,
                            "flex items-center justify-center font-medium transition-all relative overflow-hidden",
                            cn(
                              "rounded border-2",
                              seat ? getSeatColor(seat.isActive) : "bg-transparent border-transparent",
                            ),
                            (seat?.seatType === "EMPTY" || !seat) &&
                              cn("bg-transparent border-transparent opacity-0", !onSeatClick && "pointer-events-none"),
                            selectedSeats.includes(seat?.id || "") && "ring-2 ring-primary ring-offset-1",
                            seat && onSeatClick && "cursor-pointer",
                            (!seat || (!onSeatClick && seat.seatType === "EMPTY")) && "cursor-default",
                          )}
                          onClick={() => seat && onSeatClick?.(seat)}
                          disabled={!seat || (!onSeatClick && seat.seatType === "EMPTY")}
                          title={seat ? `Seat: ${seat.seatNumber}` : "Space"}
                        >
                          {seat && seat.seatType === "SEATER" ? (
                            <>{compact ? seat.seatNumber?.slice(0, 2) : seat.seatNumber}</>
                          ) : null}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {!compact && (
        <div className="flex flex-wrap gap-4 mt-6 justify-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border-2 bg-primary/20 border-primary" />
            <span className="text-muted-foreground">Available Seat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border-2 bg-muted border-border" />
            <span className="text-muted-foreground">Blocked / Path</span>
          </div>
        </div>
      )}
    </div>
  );
}
