import {
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ApplyCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ApplyCouponModal({ isOpen, onClose, onApply, isLoading = false, error = null }: ApplyCouponModalProps) {
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  return (
    <div className="absolute inset-x-0 inset-y-0 z-[100] bg-black/40 flex flex-col justify-end overflow-hidden scrollbar-hide">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-t-3xl flex flex-col h-[30%] shadow-sm relative animate-in slide-in-from-bottom duration-300">
        {/* Modal Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900">Apply Coupon</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Coupon Input Area */}
        <div className="p-5 flex-1">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              placeholder="Enter Coupon Code"
              disabled={isLoading}
              className={`w-full h-12 bg-white border ${
                error ? "border-red-500" : "border-slate-200"
              } rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 ${
                error ? "focus:ring-red-500/20" : "focus:ring-blue-500/20"
              } disabled:opacity-50`}
            />
            <button
              onClick={() => onApply(code)}
              disabled={isLoading || !code.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 font-black text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
              Apply
            </button>
          </div>
          {error && <p className="mt-2 text-xs font-bold text-red-500 px-1">{error}</p>}
        </div>

        {/* Safe Area Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
