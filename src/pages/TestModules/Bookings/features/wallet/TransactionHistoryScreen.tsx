import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionList } from "./components/TransactionList";
import { walletApi, Transaction } from "./api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

type SourceFilter = "ALL" | "WALLET" | "GATEWAY";
type TypeFilter = "ALL" | "CREDIT" | "DEBIT";
type DateFilter = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "LAST_30_DAYS" | "LAST_90_DAYS";

const SOURCE_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "WALLET", label: "Wallet" },
  { value: "GATEWAY", label: "Gateway" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CREDIT", label: "Credit" },
  { value: "DEBIT", label: "Debit" },
];

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "ALL", label: "All time" },
  { value: "TODAY", label: "Today" },
  { value: "THIS_WEEK", label: "This week" },
  { value: "THIS_MONTH", label: "This month" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
  { value: "LAST_90_DAYS", label: "Last 90 days" },
];

interface TransactionHistoryScreenProps {
  onBack: () => void;
  onTransactionClick: (id: string) => void;
}

function FilterChip<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
              value === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TransactionHistoryScreen({ onBack, onTransactionClick }: TransactionHistoryScreenProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<SourceFilter>("ALL");
  const [type, setType] = useState<TypeFilter>("ALL");
  const [datePreset, setDatePreset] = useState<DateFilter>("ALL");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchPage = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      try {
        const offset = (pageNum - 1) * PAGE_SIZE;
        const res = await walletApi.getTransactions(PAGE_SIZE, offset, {
          filter: source,
          type: type === "ALL" ? undefined : type,
          datePreset: datePreset === "ALL" ? undefined : datePreset,
        });
        setTransactions(res.data);
        setTotal(res.pagination?.total ?? res.data.length);
      } catch {
        setTransactions([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [source, type, datePreset],
  );

  useEffect(() => {
    setPage(1);
  }, [source, type, datePreset]);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const hasActiveFilters = source !== "ALL" || type !== "ALL" || datePreset !== "ALL";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
            <ChevronLeft className="h-5 w-5 text-slate-900" />
          </Button>
          <h2 className="text-[17px] font-black text-slate-900 tracking-tight">Transaction History</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0 bg-white border-b border-slate-100 px-4 py-4 space-y-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSource("ALL");
                setType("ALL");
                setDatePreset("ALL");
                setPage(1);
              }}
              className="text-xs font-semibold text-primary ml-1"
            >
              Clear
            </button>
          )}
        </div>
        <FilterChip label="Source" options={SOURCE_OPTIONS} value={source} onChange={setSource} />
        <FilterChip label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
        <FilterChip label="Date" options={DATE_OPTIONS} value={datePreset} onChange={setDatePreset} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 min-h-[280px]">
            <TransactionList
              transactions={transactions}
              isLoading={isLoading}
              onTransactionClick={(tx) => onTransactionClick(tx.id)}
            />
          </div>
        </div>
      </div>

      {/* Bottom pagination */}
      <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-between max-w-[375px] mx-auto">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1 font-semibold"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <span className="text-sm font-medium text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1 font-semibold"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
