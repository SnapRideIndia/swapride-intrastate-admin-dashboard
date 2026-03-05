import React, { useState } from "react";
import { AuthContainer } from "./AuthContainer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface RegistrationScreenProps {
  onRegister: (fullName: string, email: string, password: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister, onCancel, isLoading }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email && password && password === confirmPassword) {
      onRegister(fullName, email, password);
    }
  };

  return (
    <AuthContainer onBack={onCancel}>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="space-y-4 flex-1 pt-4">
          {/* Full Name Block */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#001B4B] tracking-[#0.15em] uppercase opacity-60">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-transparent outline-none border-none border-b border-slate-100 focus:border-primary transition-all text-sm font-bold p-0 pb-1 h-8 tracking-tight placeholder:text-slate-200"
            />
          </div>

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

          {/* Set Password Block */}
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-black text-[#001B4B] tracking-[#0.15em] uppercase opacity-60">
              Set Password
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
          </div>

          {/* Confirm Password Block */}
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-black text-[#001B4B] tracking-[#0.15em] uppercase opacity-60">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent outline-none border-none border-b border-slate-100 focus:border-primary transition-all text-sm font-bold p-0 pb-1 h-8 tracking-widest placeholder:text-slate-200"
            />
          </div>
        </div>

        <div className="pb-8">
          <Button
            type="submit"
            disabled={isLoading || !fullName || !email || !password || password !== confirmPassword}
            className="w-full h-12 bg-[#F4B400] hover:bg-[#D49E00] text-[#001B4B] font-black text-base rounded-xl shadow-lg active:scale-[0.98] transition-all"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Proceed"}
          </Button>
        </div>
      </form>
    </AuthContainer>
  );
};
