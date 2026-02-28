import { useState } from "react";
import { Bus } from "@/types";
import { LayoutPreviewGrid } from "./LayoutPreviewGrid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Grid } from "lucide-react";

interface BusLayoutDialogProps {
  bus: Bus;
  triggerText?: string;
}

export function BusLayoutDialog({ bus, triggerText = "Layout" }: BusLayoutDialogProps) {
  const [open, setOpen] = useState(false);
  const { layout } = bus;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Grid className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Bus Layout - {bus.busNumber}</DialogTitle>
          <DialogDescription>
            {bus.model} • {layout?.totalSeats || bus.seatCapacity} seats • {layout?.totalRows || "N/A"} rows ×{" "}
            {layout?.totalColumns || "N/A"} columns
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {layout ? (
            <div className="bg-muted/10 rounded-xl p-6 border-2 border-dashed border-border/40">
              <LayoutPreviewGrid layout={layout} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
              <Grid className="h-10 w-10 mb-2 opacity-50" />
              <p>No layout configuration found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
