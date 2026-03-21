import React, { useEffect, useState } from "react";
import { ArrowLeft, ScanLine } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { searchApi } from "../api/search";
import { format } from "date-fns";
import { SimulatorLogger } from "../../shared/SimulatorLogger";
import { API_ENDPOINTS } from "../../../../api/endpoints";

interface TicketDetailScreenProps {
  bookingId: string;
  onBack: () => void;
  logger: SimulatorLogger;
}

const TicketDetailScreen: React.FC<TicketDetailScreenProps> = ({ bookingId, onBack, logger }) => {
  const [ticket, setTicket] = useState<any>(null);
  const [qrCodeToken, setQrCodeToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicket();
  }, [bookingId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await searchApi.getBookingById(bookingId);
      setTicket(response);
      
      const tokenResponse = await searchApi.getTicketDetail(bookingId);
      setQrCodeToken(tokenResponse?.qrCodeToken ?? null);

      logger.success("Ticket details loaded");
    } catch (error: any) {
      logger.apiError(error.response?.status || "ERR", `GET ${API_ENDPOINTS.TEST.BOOKINGS.GET_BY_ID(bookingId)}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FFC107] rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Generating ticket...</p>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden font-sans">
      {/* Header - Compact */}
      <div className="bg-white px-4 h-14 flex items-center gap-4 shrink-0 border-b border-slate-100 relative z-20">
        <button onClick={onBack} className="p-1 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Your Ticket</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center min-h-0 bg-white">
        {/* Ticket Card - Pixel Perfect Match */}
        <div className="w-full max-w-[320px] bg-[#FFC107] rounded-3xl flex flex-col shadow-sm relative overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-200/20">
          {/* QR Container */}
          <div className="pt-8 pb-6 flex items-center justify-center">
            <div className="bg-white rounded-lg p-3 flex items-center justify-center shadow-sm">
              <QRCodeSVG
                value={qrCodeToken ?? ''}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Dotted Line */}
          <div className="border-t-2 border-white border-dotted mx-2 mb-4" />

          {/* Journey Path */}
          <div className="px-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 tracking-tight">
              <span className="flex-1 text-left truncate">{ticket.pickupStop?.point?.name || "Location A"}</span>
              <div className="flex flex-col -space-y-1 mx-4 shrink-0">
                <div className="w-10 h-[1.5px] bg-slate-900" />
                <div className="w-10 h-[1.5px] bg-slate-900" />
              </div>
              <span className="flex-1 text-right truncate">{ticket.dropStop?.point?.name || "Location B"}</span>
            </div>

            {/* Time Bar */}
            <div className="bg-[#0A0B1E] py-1.5 rounded-md text-center">
              <span className="text-white font-bold text-[10px] tracking-wide uppercase">
                {format(new Date(ticket.trip?.scheduledDepartureAt || ticket.createdAt), "h:mm a")} -{" "}
                {format(new Date(ticket.trip?.scheduledArrivalAt || ticket.createdAt), "h:mm a")}
              </span>
            </div>

            {/* Info Boxes */}
            <div className="grid grid-cols-2 gap-3 pb-8">
              <div className="bg-white rounded-lg py-2 flex items-center justify-center border border-slate-100">
                <span className="text-slate-900 font-bold text-[11px] tracking-tight">
                  {ticket.trip?.bus?.busNumber || "AB-09-2379"}
                </span>
              </div>
              <div className="bg-[#FBC02D] rounded-lg py-2 flex items-center justify-center border border-black/5">
                <span className="text-slate-800 font-bold text-[11px] tracking-tight">
                  Date:{" "}
                  <span className="text-black font-black">
                    {format(new Date(ticket.trip?.tripDate || ticket.createdAt), "dd.MM.yy")}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-[320px] space-y-3 pt-8">
          <button className="w-full h-11 bg-[#FFC107] hover:bg-[#FFB300] text-slate-900 font-bold rounded-lg flex items-center justify-center gap-3 shadow-md border border-amber-400/20 active:scale-[0.98] transition-all">
            <span className="text-sm">Scan Bus QR</span>
            <div className="w-5 h-5 flex items-center justify-center border-[1.5px] border-slate-900 rounded-sm">
              <ScanLine className="w-3.5 h-3.5 stroke-[2.5px]" />
            </div>
          </button>
          <button className="w-full h-11 bg-white hover:bg-slate-50 text-[#1C2434] font-bold text-sm rounded-lg border border-[#1C2434] active:scale-[0.98] transition-all">
            View Bus Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailScreen;
