import React, { useState } from "react";
import { AuthContainer } from "./AuthContainer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface PhoneEntryScreenProps {
  onSendOtp: (mobileNumber: string, referralCode?: string) => Promise<void>;
  isLoading: boolean;
}

export const PhoneEntryScreen: React.FC<PhoneEntryScreenProps> = ({ onSendOtp, isLoading }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreed, setAgreed] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length >= 10 && agreed) {
      onSendOtp(mobileNumber, referralCode);
    }
  };

  return (
    <AuthContainer
      title="Welcome to Swapride!"
      subtitle="Daily office travel, made simple — book your ride in just a few taps."
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="space-y-8 flex-1 pt-8">
          {/* Mobile Input */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-[#001B4B] tracking-[#0.15em] uppercase opacity-60">
              Enter your number
            </label>
            <div className="flex items-center gap-0 border-b-2 border-slate-100 focus-within:border-primary transition-all pb-2">
              <div className="flex items-center pr-3 border-r-2 border-slate-100 h-8 mr-3">
                <span className="text-xl font-black text-[#001B4B] leading-none">+ 91</span>
              </div>
              <input
                type="tel"
                placeholder="8926372963"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="flex-1 bg-transparent outline-none border-none text-xl font-black text-[#001B4B] p-0 h-auto tracking-[0.1em] placeholder:text-slate-200"
              />
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-4 pt-4">
            <label className="text-[11px] font-black text-[#001B4B] tracking-[#0.15em] uppercase opacity-60">
              Have any Referral Code?
            </label>
            <input
              type="text"
              placeholder="Enter code here"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full bg-transparent outline-none border-none border-b-2 border-slate-50 focus:border-primary/30 transition-all text-sm font-bold p-0 h-10 tracking-[0.05em] placeholder:text-slate-200"
            />
          </div>

          {/* Agreement Checkbox */}
          <div className="flex gap-4 pt-10">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(val) => setAgreed(!!val)}
              className="mt-1 border-[#001B4B] data-[state=checked]:bg-[#001B4B]"
            />
            <label htmlFor="terms" className="text-[11px] font-medium text-slate-500 normal-case leading-relaxed">
              I agree to share my Personally identifiable Information like name,email,mobile number , etc. I agree to
              the Terms of service and Privacy Policy of swapride app
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="pb-8">
          <Button
            type="submit"
            disabled={isLoading || mobileNumber.length < 10 || !agreed}
            className="w-full h-12 bg-[#F4B400] hover:bg-[#D49E00] text-[#001B4B] font-black text-base rounded-xl shadow-lg shadow-black/5 active:scale-[0.98] transition-all"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
          </Button>
        </div>
      </form>
    </AuthContainer>
  );
};
