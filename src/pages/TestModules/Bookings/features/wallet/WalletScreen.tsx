import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletCard } from "./components/WalletCard";
import { TransactionList } from "./components/TransactionList";
import { walletApi, WalletBalance, Transaction } from "./api";
import { useToast } from "@/hooks/use-toast";
import { SimulatorLogger } from "../../../shared/SimulatorLogger";
import { cn } from "@/lib/utils";

interface WalletScreenProps {
  onBack: () => void;
  logger: SimulatorLogger;
  onRefreshProfile?: () => void;
  onViewAll?: () => void;
}

const TOPUP_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function WalletScreen({ onBack, logger, onRefreshProfile, onViewAll }: WalletScreenProps) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [isProcessingTopup, setIsProcessingTopup] = useState(false);

  const { toast } = useToast();

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const [balanceData, txData] = await Promise.all([walletApi.getBalance(), walletApi.getTransactions(20, 0)]);
        setBalance(balanceData);
        setTransactions(txData.data);
        if (!silent) logger.success("Wallet data synchronized");
        if (silent && onRefreshProfile) onRefreshProfile();
      } catch (error: any) {
        logger.error(`Wallet Sync Failed: ${error.message}`);
        toast({
          title: "Sync Error",
          description: "Failed to fetch wallet information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [logger, toast],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTopUpConfirm = async () => {
    try {
      setIsProcessingTopup(true);
      logger.admin(`Initiating top-up for ₹${selectedAmount}...`);

      const response = await walletApi.initiateTopup(selectedAmount);
      const { gatewayData } = response;

      const options = {
        key: gatewayData.razorpayKeyId,
        amount: gatewayData.amount * 100, // paisa
        currency: gatewayData.currency,
        name: "SwapRide Wallet",
        description: `Wallet Top-up - ₹${selectedAmount}`,
        order_id: gatewayData.razorpayOrderId,
        handler: function (res: any) {
          logger.success("Payment authorized by gateway.");
          logger.admin(`Gateway Ref: ${res.razorpay_payment_id}`);
          setIsTopUpModalOpen(false);
          // Wait a bit for backend processing
          setTimeout(() => fetchData(true), 2000);
          toast({
            title: "Top-Up Successful",
            description: `₹${selectedAmount} added to your wallet.`,
          });
        },
        modal: {
          ondismiss: function () {
            logger.error("Payment modal closed by user.");
            setIsProcessingTopup(false);
          },
        },
        prefill: {
          name: "Test User",
          email: "test@swapride.com",
          contact: "9999999999",
        },
        theme: { color: "#1751BC" },
      };

      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        throw new Error("Razorpay SDK not loaded.");
      }

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error: any) {
      logger.error(`Top-up Failed: ${error.message}`);
      toast({
        title: "Top-up Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessingTopup(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden relative">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
            <ChevronLeft className="h-5 w-5 text-slate-900" />
          </Button>
          <h2 className="text-[17px] font-black text-slate-900">My Wallet</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-slate-50 rounded-full flex items-center justify-center">
            <History className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-8">
          {/* Main Wallet Card */}
          <WalletCard
            balance={balance?.balance || 0}
            onTopUp={() => setIsTopUpModalOpen(true)}
            isLoading={isRefreshing}
          />

          {/* Transaction Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Activities</h3>
              <Button
                variant="ghost"
                className="h-auto p-0 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-transparent"
                onClick={onViewAll}
              >
                View All
              </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <TransactionList transactions={transactions} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Footer Padding */}
        <div className="h-12" />
      </div>

      {/* TopUp Modal Overlay */}
      {isTopUpModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isProcessingTopup && setIsTopUpModalOpen(false)}
          />
          <div className="bg-white rounded-t-[3rem] p-8 pb-10 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Top Up Wallet</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Select Amount</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setIsTopUpModalOpen(false)}
                disabled={isProcessingTopup}
              >
                <X className="h-6 w-6 text-slate-900" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {TOPUP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  className={cn(
                    "h-12 rounded-2xl border-2 font-black text-sm transition-all active:scale-95",
                    selectedAmount === amt
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200",
                  )}
                  disabled={isProcessingTopup}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
                <input
                  type="number"
                  value={selectedAmount || ""}
                  onChange={(e) => setSelectedAmount(Number(e.target.value))}
                  placeholder="Enter custom amount"
                  className="w-full h-16 pl-12 pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-lg focus:outline-none focus:border-primary/30 transition-all"
                  disabled={isProcessingTopup}
                />
              </div>
            </div>

            <Button
              className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black text-lg shadow-sm transition-all active:scale-[0.98]"
              onClick={handleTopUpConfirm}
              disabled={isProcessingTopup || !selectedAmount || selectedAmount <= 0}
            >
              {isProcessingTopup ? "Processing..." : `Add ₹${selectedAmount || 0}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
