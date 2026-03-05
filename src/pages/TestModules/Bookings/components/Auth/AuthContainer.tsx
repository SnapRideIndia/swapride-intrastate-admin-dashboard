import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthContainerProps {
  children: React.ReactNode;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children, onBack, title, subtitle }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden font-sans uppercase">
      {/* Banner Section */}
      <div className="relative h-2/5 shrink-0">
        <img src="/src/assets/images/banner.png" alt="Swapride Banner" className="w-full h-full object-cover" />
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white"
            onClick={onBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-6 -mt-6 bg-white rounded-t-[32px] shadow-2xl relative z-10 overflow-hidden">
        {(title || subtitle) && (
          <div className="mb-8 pt-2 shrink-0">
            {title && <h1 className="text-2xl font-black text-[#001B4B] tracking-tight">{title}</h1>}
            {subtitle && <p className="text-sm font-medium text-slate-500 mt-2 normal-case">{subtitle}</p>}
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-y-auto pr-2 -mr-2 scrollbar-hide">{children}</div>
      </div>
    </div>
  );
};
