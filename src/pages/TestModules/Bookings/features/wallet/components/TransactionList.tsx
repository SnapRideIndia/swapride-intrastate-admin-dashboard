import { Transaction } from "../api";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, HelpCircle, Clock, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const getStatusIcon = (status: Transaction["status"]) => {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case "FAILED":
      return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case "PENDING":
      return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    default:
      return <HelpCircle className="h-3.5 w-3.5 text-slate-400" />;
  }
};

const getSourceIcon = (type: Transaction["type"], source: Transaction["source"]) => {
  if (type === "CREDIT") {
    return (
      <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
        <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
      <ArrowUpRight className="h-5 w-5 text-slate-600" />
    </div>
  );
};

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="h-10 w-10 bg-slate-100 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-100 rounded w-1/3" />
              <div className="h-2 bg-slate-50 rounded w-1/4" />
            </div>
            <div className="h-4 bg-slate-100 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center">
          <Clock className="h-6 w-6 text-slate-300" />
        </div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Transactions Yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded-2xl transition-all duration-200"
        >
          {getSourceIcon(tx.type, tx.source)}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h4 className="text-[14px] font-black text-slate-900 truncate tracking-tight">{tx.description}</h4>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">{getStatusIcon(tx.status)}</div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {format(new Date(tx.date), "dd MMM yyyy • h:mm a")}
            </p>
          </div>

          <div className="text-right">
            <p
              className={cn(
                "text-[15px] font-black tracking-tighter",
                tx.type === "CREDIT" ? "text-emerald-600" : "text-slate-900",
              )}
            >
              {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount}
            </p>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{tx.source}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
