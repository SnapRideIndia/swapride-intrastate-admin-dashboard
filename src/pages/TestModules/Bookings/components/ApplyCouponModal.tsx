import {
  X,
  LayoutGrid,
  Smile,
  FileType,
  Settings,
  Palette,
  MoreHorizontal,
  Mic,
  Globe,
  Search,
  Delete,
  CornerDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ApplyCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
}

export function ApplyCouponModal({ isOpen, onClose, onApply }: ApplyCouponModalProps) {
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  return (
    <div className="absolute inset-x-0 inset-y-0 z-[100] bg-black/40 flex flex-col justify-end overflow-hidden no-scrollbar">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-t-3xl flex flex-col h-[30%] shadow-2xl relative animate-in slide-in-from-bottom duration-300">
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
              className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={() => onApply(code)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 font-black text-sm"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Safe Area Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
