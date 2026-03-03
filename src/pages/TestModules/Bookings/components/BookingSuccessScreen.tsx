import React from "react";
import { CheckCircle2, Ticket } from "lucide-react";

interface BookingSuccessScreenProps {
  onViewTicket: () => void;
}

const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({ onViewTicket }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-500/5 border border-slate-100 max-w-[340px] w-full flex flex-col items-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-8 ring-8 ring-emerald-500/5 animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>

        <div className="space-y-3 text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Booking Confirmed!</h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">
            Great news! Your inter-state journey has been successfully booked and recorded.
          </p>
        </div>

        <div className="w-full bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100 border-dashed">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
            Reference Status
          </p>
          <p className="text-sm font-bold text-center text-slate-700 mt-1">Transaction Authorized</p>
        </div>

        <button
          onClick={onViewTicket}
          className="w-full h-14 bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-extrabold text-base rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
        >
          <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          View Digital Pass
        </button>
      </div>

      <p className="mt-8 text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">SwapRide Official Ticket</p>
    </div>
  );
};

export default BookingSuccessScreen;
