import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConditionCardProps {
  title: string;
  expiry: string | Date | null | undefined;
  icon: LucideIcon;
}

export const ConditionCard = ({ title, expiry, icon: Icon }: ConditionCardProps) => {
  const isExpired = expiry && new Date(expiry) < new Date();

  return (
    <div
      className={cn(
        "dashboard-card p-5 border shadow-sm",
        isExpired ? "border-destructive/30 bg-destructive/5" : "bg-white",
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-lg", isExpired ? "bg-destructive/20" : "bg-primary/10")}>
          <Icon className={cn("h-4 w-4", isExpired ? "text-destructive" : "text-primary")} />
        </div>
        <h4 className="font-bold text-sm tracking-tight">{title}</h4>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Expiry Date</p>
          <p className={cn("text-lg font-bold", isExpired && "text-destructive")}>
            {expiry ? new Date(expiry).toLocaleDateString() : "N/A"}
          </p>
        </div>
        {isExpired && (
          <span className="bg-destructive text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter mb-1">
            Expired
          </span>
        )}
      </div>
    </div>
  );
};
