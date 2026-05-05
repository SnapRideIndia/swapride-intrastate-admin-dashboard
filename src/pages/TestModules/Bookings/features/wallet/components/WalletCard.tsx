import { Plus, Wallet as WalletIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  balance: number;
  onTopUp: () => void;
  isLoading?: boolean;
}

export function WalletCard({ balance, onTopUp, isLoading }: WalletCardProps) {
  return (
    <Card className="relative overflow-hidden bg-white border-none shadow-sm rounded-[2.5rem] p-6 group">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl transition-colors duration-500" />

      <div className="relative z-10 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center">
              <WalletIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Active Balance
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-slate-50 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 text-slate-400", isLoading && "animate-spin")} />
          </Button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-400">₹</span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">
                {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <Button
            onClick={onTopUp}
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm group/btn relative overflow-hidden active:scale-95 transition-all"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Top Up
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
