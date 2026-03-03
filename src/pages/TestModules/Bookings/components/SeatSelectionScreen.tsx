import { ChevronLeft, Armchair, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { searchApi } from "../api/search";

interface SeatSelectionScreenProps {
  onBack: () => void;
  onConfirm: (seat: string) => void;
  initialSeat?: string;
  tripId: string | undefined;
}

export function SeatSelectionScreen({ onBack, onConfirm, initialSeat, tripId }: SeatSelectionScreenProps) {
  const [selectedSeat, setSelectedSeat] = useState<string>(initialSeat || "");
  const [seats, setSeats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!tripId) return;
      setIsLoading(true);
      try {
        const data = await searchApi.getSeatAvailability(tripId);
        setSeats(data.seats);
        if (!initialSeat) {
          // If no initial seat provided, leave selection empty
        }
      } catch (err: any) {
        setError(err.message || "Failed to load seats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeats();
  }, [tripId, initialSeat]);

  // Group seats by row for rendering
  const maxRow = Math.max(...seats.map((s) => s.rowPosition), 0);
  const rows = Array.from({ length: maxRow + 1 }, (_, i) => i);
  const maxCol = Math.max(...seats.map((s) => s.colPosition), 0);
  const columns = Array.from({ length: maxCol + 1 }, (_, i) => i);

  const getSeatAt = (row: number, col: number) => {
    return seats.find((s) => s.rowPosition === row && s.colPosition === col);
  };

  const renderSeat = (row: number, col: number) => {
    const seat = getSeatAt(row, col);
    // Hide seat if it doesn't exist or is explicitly marked as EMPTY
    if (!seat || seat.seatType === "EMPTY") return <div key={`empty-${row}-${col}`} className="w-9 h-9" />;

    const isOccupied = seat.status !== "AVAILABLE";
    const isSelected = selectedSeat === seat.seatNumber;
    const isHeld = seat.status === "HELD";
    const isBooked = seat.status === "BOOKED";

    return (
      <button
        key={seat.seatId}
        disabled={isOccupied}
        onClick={() => setSelectedSeat(seat.seatNumber)}
        title={`${seat.seatNumber} - ${seat.status.charAt(0) + seat.status.slice(1).toLowerCase()}`}
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center transition-all relative overflow-hidden group",
          isSelected
            ? "bg-[#FFC107] border-2 border-[#E6AF06] shadow-sm"
            : isBooked
              ? "bg-slate-300 border border-slate-400"
              : isHeld
                ? "bg-blue-100 border border-blue-200"
                : "bg-white border border-slate-200",
        )}
      >
        <Armchair
          className={cn("h-5 w-5", isOccupied ? "text-slate-400" : isSelected ? "text-slate-900" : "text-slate-300")}
        />
        {(isSelected || (isOccupied && seat.seatNumber)) && (
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center text-[9px] font-black mt-0.5",
              isSelected ? "text-slate-900" : "text-slate-400 opacity-0 group-hover:opacity-100",
            )}
          >
            {seat.seatNumber}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-4 border-b border-slate-100">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 text-slate-900" />
        </Button>
        <h2 className="text-[17px] font-black text-slate-900">Select a seat</h2>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Layout...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="px-5 py-4 flex gap-4 overflow-x-auto no-scrollbar border-b border-slate-100 shrink-0 justify-center">
            <LegendItem color="bg-white border border-slate-200" label="Available" />
            <LegendItem color="bg-blue-100 border border-blue-200" label="Held" />
            <LegendItem color="bg-slate-300 border border-slate-400" label="Booked" />
            <LegendItem color="bg-[#FFC107]" label="Selected" />
          </div>

          {/* Seat Map Area */}
          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="bg-white rounded-[2rem] border-[3px] border-blue-400 p-6 shadow-2xl relative w-full h-full max-w-[320px] pt-12 flex flex-col">
              {/* Bus Front */}
              <div className="absolute top-0 left-0 right-0 h-10 border-b border-dashed border-blue-200 flex items-center justify-center">
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">Front of Bus</span>
              </div>

              {/* Grid Container */}
              <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
                <div className="flex flex-col gap-3 items-center">
                  {rows.map((row) => (
                    <div key={row} className="flex gap-3">
                      {columns.map((col) => renderSeat(row, col))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 space-y-4 shrink-0 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
            <p className="text-center font-black text-slate-900 text-sm">
              {selectedSeat ? (
                <>
                  you have selected the seat <span className="text-blue-600 uppercase">{selectedSeat}</span> !
                </>
              ) : (
                "Please select a seat"
              )}
            </p>

            <Button
              disabled={!selectedSeat}
              onClick={() => onConfirm(selectedSeat)}
              className="w-full h-12 bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-black text-[15px] rounded-xl shadow-lg"
            >
              Confirm Seat
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className={cn("h-3 w-3 rounded-md", color)} />
      <span className="text-[10px] font-black text-slate-600 whitespace-nowrap uppercase tracking-wider">{label}</span>
    </div>
  );
}
