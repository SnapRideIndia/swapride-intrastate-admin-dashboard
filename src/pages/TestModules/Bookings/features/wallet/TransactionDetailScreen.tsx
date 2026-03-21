import { useEffect, useState } from "react";
import { ChevronLeft, CheckCircle2, XCircle, Clock, Receipt, Hash, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { walletApi, TransactionDetailResponse } from "./api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TransactionDetailScreenProps {
  transactionId: string;
  onBack: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: typeof CheckCircle2; className: string }> = {
    SUCCESS: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700" },
    FAILED: { icon: XCircle, className: "bg-red-50 text-red-700" },
    PENDING: { icon: Clock, className: "bg-amber-50 text-amber-700" },
    REVERSED: { icon: XCircle, className: "bg-slate-100 text-slate-600" },
    REFUNDED: { icon: CheckCircle2, className: "bg-blue-50 text-blue-700" },
  };
  const config = map[status] ?? { icon: Clock, className: "bg-slate-100 text-slate-600" };
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", config.className)}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

export default function TransactionDetailScreen({ transactionId, onBack }: TransactionDetailScreenProps) {
  const [detail, setDetail] = useState<TransactionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    walletApi
      .getTransactionById(transactionId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load transaction");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 h-full">
        <div className="bg-white px-4 py-4 flex items-center border-b border-slate-100">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
            <ChevronLeft className="h-5 w-5 text-slate-900" />
          </Button>
          <h2 className="text-[17px] font-black text-slate-900 ml-2">Transaction</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-pulse space-y-4 w-full max-w-[280px]">
            <div className="h-20 bg-slate-200 rounded-2xl" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 h-full">
        <div className="bg-white px-4 py-4 flex items-center border-b border-slate-100">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
            <ChevronLeft className="h-5 w-5 text-slate-900" />
          </Button>
          <h2 className="text-[17px] font-black text-slate-900 ml-2">Transaction</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-slate-500 font-medium">{error ?? "Not found"}</p>
        </div>
      </div>
    );
  }

  const isCredit = detail.direction === "CREDIT";
  const amountNum = parseFloat(detail.amount);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center border-b border-slate-100 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 text-slate-900" />
        </Button>
        <h2 className="text-[17px] font-black text-slate-900 ml-2 tracking-tight">Transaction Details</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        {/* Amount card */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col items-center text-center mb-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{detail.title}</p>
            <p className={cn("text-3xl font-black tracking-tighter", isCredit ? "text-emerald-600" : "text-slate-900")}>
              {isCredit ? "+" : "-"}₹{amountNum.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-slate-500 mt-1">{detail.currency}</p>
            <div className="mt-3">
              <StatusBadge status={detail.status} />
            </div>
          </div>
        </div>

        {/* Meta card */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
              <p className="text-sm font-semibold">{format(new Date(detail.createdAt), "dd MMM yyyy • h:mm a")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source</p>
              <p className="text-sm font-semibold">{detail.source}</p>
            </div>
          </div>
          {(detail.transactionRefId || detail.gatewayOrderId) && (
            <div className="flex items-center gap-3 text-slate-600">
              <Hash className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference</p>
                <p className="text-sm font-semibold truncate">
                  {detail.transactionRefId || detail.gatewayOrderId || "—"}
                </p>
              </div>
            </div>
          )}
          {detail.description && (
            <div className="flex items-start gap-3 text-slate-600">
              <Receipt className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</p>
                <p className="text-sm font-medium">{detail.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Balance snapshot (if wallet) */}
        {(detail.balanceBefore != null || detail.balanceAfter != null) && (
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Balance snapshot</p>
            <div className="flex justify-between text-sm">
              {detail.balanceBefore != null && (
                <span className="text-slate-600">
                  Before:{" "}
                  <span className="font-semibold">₹{parseFloat(detail.balanceBefore).toLocaleString("en-IN")}</span>
                </span>
              )}
              {detail.balanceAfter != null && (
                <span className="text-slate-600">
                  After:{" "}
                  <span className="font-semibold">₹{parseFloat(detail.balanceAfter).toLocaleString("en-IN")}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Booking summary */}
        {detail.booking && (
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Linked booking</p>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-800">₹{detail.booking.totalAmount}</p>
              {(detail.booking.pickupName || detail.booking.dropName) && (
                <p className="text-slate-600">
                  {detail.booking.pickupName} → {detail.booking.dropName}
                </p>
              )}
              <p className="text-slate-500 text-xs">{detail.booking.status}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
