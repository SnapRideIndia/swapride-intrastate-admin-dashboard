import { LucideIcon } from "lucide-react";

interface InfoItemProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export const InfoItem = ({ label, value, icon: Icon }: InfoItemProps) => (
  <div className="flex gap-4 group">
    <div className="mt-1">
      <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-0.5">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  </div>
);
