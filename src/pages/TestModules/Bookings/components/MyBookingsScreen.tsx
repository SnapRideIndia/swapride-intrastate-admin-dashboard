import React, { useEffect, useState } from "react";
import { ArrowLeft, Bus, MapPin } from "lucide-react";
import { format } from "date-fns";
import { searchApi } from "../api/search";
import { SimulatorLogger } from "../../shared/SimulatorLogger";
import { API_ENDPOINTS } from "../../../../api/endpoints";

interface MyBookingsScreenProps {
  onBack: () => void;
  onViewTicket: (bookingId: string) => void;
  logger: SimulatorLogger;
}

const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({ onBack, onViewTicket, logger }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await searchApi.getMyBookings();
      setBookings(response.data || []);
      logger.success("Fetched user bookings successfully");
    } catch (error: any) {
      logger.apiError(error.response?.status || "ERR", `GET ${API_ENDPOINTS.TEST.BOOKINGS.MY_BOOKINGS}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FB] overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 h-16 flex items-center gap-4 shrink-0 border-b border-slate-100 shadow-sm relative z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Your Tickets</h1>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FFC107] rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Fetching tickets...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Bus className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No active tickets found</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3 animate-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
                    Bus Ticket <span className="text-slate-300 mx-1">•</span> {booking.trip?.busNumber || "C123"}
                  </span>
                </div>
                <div className="bg-green-50 text-green-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-green-100 uppercase">
                  {format(new Date(booking.trip?.departureTime || booking.createdAt), "dd.MM.yyyy")}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 relative py-1">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-black text-slate-900 leading-tight">
                    {booking.pickup || "Location A"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {format(new Date(booking.trip?.departureTime || booking.createdAt), "h:mm a")}
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center px-2">
                  <div className="w-full flex items-center justify-between relative opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full border border-slate-400 shrink-0" />
                    <div className="flex-1 border-t border-dashed border-slate-300 mx-1" />
                    <Bus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="flex-1 border-t border-dashed border-slate-300 mx-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-0.5">
                  <span className="text-sm font-black text-slate-900 leading-tight text-right">
                    {booking.dropoff || "Location B"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {format(
                      new Date(booking.trip?.departureTime || booking.createdAt).getTime() + 2 * 3600000,
                      "h:mm a",
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => onViewTicket(booking.id)}
                  className="h-9 bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 text-xs font-black uppercase rounded-xl transition-all active:scale-[0.98] shadow-sm"
                >
                  View ticket
                </button>
                <button className="h-9 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase rounded-xl border border-slate-200 transition-all active:scale-[0.98]">
                  Track Ride
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBookingsScreen;
