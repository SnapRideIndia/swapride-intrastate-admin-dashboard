import React, { useState } from "react";
import { AuthContainer } from "./AuthContainer";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface PasswordLoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onBackToPhone: () => void;
  isLoading: boolean;
}

export const PasswordLoginScreen: React.FC<PasswordLoginScreenProps> = ({ onLogin, onBackToPhone, isLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <AuthContainer onBack={onBackToPhone}>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="space-y-4 flex-1 pt-4">
          {/* Email Block */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#001B4B] tracking-[#0.15em] uppercase opacity-60">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none border-none border-b border-slate-100 focus:border-primary transition-all text-sm font-bold p-0 pb-1 h-8 tracking-tight lowercase placeholder:text-slate-200"
            />
          </div>

          {/* Password Block */}
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-black text-[#001B4B] tracking-[#0.15em] uppercase opacity-60">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none border-none border-b border-slate-100 focus:border-primary transition-all text-sm font-bold p-0 pb-1 pr-8 h-8 tracking-widest placeholder:text-slate-200"
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="absolute right-0 top-0 h-8 w-8 text-slate-300 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="link" className="text-[10px] font-black text-[#E11D48] p-0 h-auto">
                Forget Password?
              </Button>
            </div>
          </div>

          {/* Switch to Phone Login */}
          <div className="pt-6">
            <Button
              variant="link"
              type="button"
              className="text-[11px] font-black text-[#001B4B] p-0 h-auto underline opacity-70"
              onClick={onBackToPhone}
            >
              Login using Phone number
            </Button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pb-8">
          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full h-12 bg-[#F4B400] hover:bg-[#D49E00] text-[#001B4B] font-black text-base rounded-xl shadow-lg active:scale-[0.98] transition-all"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Proceed"}
          </Button>
        </div>
      </form>
    </AuthContainer>
  );
};
