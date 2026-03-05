import React from "react";
import { Bus, Wallet, History, Home, Bell, User as UserIcon, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "../../Profile/types";
import { UserProfileButton } from "../../shared/UserProfileButton";

interface UserHomeScreenProps {
  profile: UserProfile;
  onStartBooking: () => void;
  onTabChange: (tab: "HOME" | "WALLET" | "HISTORY") => void;
  onProfileClick: () => void;
  activeTab: "HOME" | "WALLET" | "HISTORY";
}

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({
  profile,
  onStartBooking,
  onTabChange,
  onProfileClick,
  activeTab,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header / Top Bar */}
      <div className="bg-primary px-6 pt-8 pb-12 rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
        {/* Abstract Background patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Welcome back</p>
              <h2 className="text-sm font-black text-white tracking-tight">{profile.fullName}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10"
            >
              <Bell className="w-5 h-5 text-white" />
            </Button>
            <button
              onClick={onProfileClick}
              className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/20 hover:border-white transition-all active:scale-95"
            >
              <img
                src={profile.profileUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tighter leading-none mb-2 relative z-10">
          Choose your
          <br />
          commute options
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-6 -mt-6 relative z-20 pb-24 overflow-y-auto scrollbar-hide">
        {/* Quick Options */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <button
            onClick={onStartBooking}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 transition-all active:scale-[0.98] group"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
              <Bus className="w-10 h-10 text-blue-600" />
            </div>
            <div className="text-left">
              <span className="text-lg font-black text-slate-900 tracking-tight block">Shuttle</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Inter-state travel</span>
            </div>
          </button>
        </div>

        {/* Tickets Quick Access */}
        <div className="mb-8">
          <button
            onClick={() => onTabChange("HISTORY")}
            className="w-full bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between transition-all active:scale-[0.98] group hover:border-primary/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-slate-900 tracking-tight block">Tickets</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  View your bookings
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </button>
        </div>

        {/* Wallet Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Your Active Wallet</h3>
            <button onClick={() => onTabChange("WALLET")} className="text-[10px] font-bold text-primary">
              View Details
            </button>
          </div>
          <div
            onClick={() => onTabChange("WALLET")}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Available Balance</p>
                <h4 className="text-xl font-black text-slate-900 tracking-tighter">
                  ₹{profile.walletBalance.toLocaleString()}
                </h4>
              </div>
            </div>
            <div className="h-10 px-4 bg-slate-900 rounded-xl flex items-center justify-center text-[10px] font-black text-white hover:bg-slate-800 transition-colors">
              TOP UP
            </div>
          </div>
        </div>

        {/* Upcoming Section Placeholder */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Upcoming Rides</h3>
          </div>
          <div className="bg-white/40 rounded-[2rem] p-8 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              No upcoming rides today.
              <br />
              Start exploring to book your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-transparent pointer-events-none z-50">
        <div className="bg-white shadow-sm rounded-3xl border border-slate-100 p-2 flex items-center justify-around pointer-events-auto">
          <button
            onClick={() => onTabChange("HOME")}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all ${activeTab === "HOME" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </button>

          <button
            onClick={() => onTabChange("WALLET")}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all ${activeTab === "WALLET" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Wallet</span>
          </button>

          <button
            onClick={() => onTabChange("HISTORY")}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all ${activeTab === "HISTORY" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-600"}`}
          >
            <History className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
