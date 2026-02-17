import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FullPageLoaderProps {
  className?: string;
  label?: string;
  show?: boolean;
}

export function FullPageLoader({ className, label = "Loading...", show = false }: FullPageLoaderProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/60 backdrop-blur-[4px] animate-in fade-in duration-200",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border shadow-2xl scale-in-95 animate-in zoom-in-95 duration-300">
        <div className="relative">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-primary/10" />
        </div>
        <p className="text-sm font-semibold text-foreground tracking-tight">{label}</p>
      </div>
    </div>
  );
}
