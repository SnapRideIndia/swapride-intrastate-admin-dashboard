import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  color: "primary" | "success" | "info" | "warning";
  icon: LucideIcon;
}

export const MetricCard = ({ title, value, color, icon: Icon }: MetricCardProps) => (
  <div
    className={cn(
      "p-5 rounded-2xl border transition-all hover:shadow-md",
      color === "primary"
        ? "bg-primary/5 border-primary/10"
        : color === "success"
          ? "bg-success/5 border-success/10"
          : color === "info"
            ? "bg-info/5 border-info/10"
            : "bg-warning/5 border-warning/10",
    )}
  >
    <div className="flex items-center gap-2 mb-3">
      <Icon
        className={cn(
          "h-4 w-4",
          color === "primary"
            ? "text-primary"
            : color === "success"
              ? "text-success"
              : color === "info"
                ? "text-info"
                : "text-warning",
        )}
      />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</span>
    </div>
    <p className="text-2xl font-black tracking-tight">{value}</p>
  </div>
);
