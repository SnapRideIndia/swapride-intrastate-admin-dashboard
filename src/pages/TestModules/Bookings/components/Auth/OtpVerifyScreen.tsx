import React, { useState, useRef, useEffect } from "react";
import { AuthContainer } from "./AuthContainer";
import { Button } from "@/components/ui/button";
import { Loader2, X, Phone } from "lucide-react";

interface OtpVerifyScreenProps {
  mobileNumber: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = ({
  mobileNumber,
  onVerify,
  onResend,
  onCancel,
  isLoading,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1); // Only take last char
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits entered
    if (newOtp.every((digit) => digit !== "")) {
      onVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <AuthContainer onBack={onCancel}>
      <div className="flex flex-col flex-1">
        {/* Header with Close */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-[#001B4B]">Enter OTP</h2>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* OTP Input Grid */}
        <div className="grid grid-cols-6 gap-3 mb-12">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-full aspect-square border-b-2 border-slate-200 focus:border-primary text-center text-2xl font-black text-[#001B4B] outline-none transition-all"
            />
          ))}
        </div>

        {/* Helper Links */}
        <div className="flex justify-between items-center text-[13px] font-black tracking-tight pt-4">
          <Button
            variant="ghost"
            className="p-0 h-auto text-[#001B4B] flex items-center gap-2 hover:bg-transparent"
            onClick={() => {}}
          >
            <Phone className="h-4 w-4 fill-[#001B4B]" />
            Get OTP on Call
          </Button>
          <Button variant="ghost" className="p-0 h-auto text-[#001B4B] hover:bg-transparent" onClick={onResend}>
            Resend OTP
          </Button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </AuthContainer>
  );
};
