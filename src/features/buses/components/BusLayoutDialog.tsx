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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bus Layout - {bus.busNumber}</DialogTitle>
          <DialogDescription>
            {bus.model} • {layout?.totalSeats || bus.seatCapacity} seats • {layout?.totalRows || "N/A"} rows ×{" "}
            {layout?.totalColumns || "N/A"} columns
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {layout ? (
            <LayoutPreviewGrid layout={layout} />
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
