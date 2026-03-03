import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Location, SimulatorScreen, TEST_USER_TOKEN_KEY } from "../types";
import { SearchResult, SearchTiming, BookingResponse, RoundTripBookingResponse } from "./types/search";
import { searchApi } from "./api/search";

// Shared Components
import { LoginModal } from "../shared/LoginModal";
import { useLogs } from "../shared/LogContext";
import { SimulatorLogger, setGlobalSimulatorLogger } from "../shared/SimulatorLogger";
import { useEffect, useMemo } from "react";

// Feature Components
import { SearchScreen } from "./components/SearchScreen";
import { LocationPickerScreen } from "./components/LocationPickerScreen";
import { SearchResultsScreen } from "./components/SearchResultsScreen";
import { BookingOptionsScreen } from "./components/BookingOptionsScreen";
import { ConfirmBookingScreen } from "./components/ConfirmBookingScreen";
import { SeatSelectionScreen } from "./components/SeatSelectionScreen";
import BookingSuccessScreen from "./components/BookingSuccessScreen";
import MyBookingsScreen from "./components/MyBookingsScreen";
import TicketDetailScreen from "./components/TicketDetailScreen";

export default function BookingSimulator() {
  const [testToken, setTestToken] = useState<string | null>(localStorage.getItem(TEST_USER_TOKEN_KEY));
  const [activeScreen, setActiveScreen] = useState<SimulatorScreen>("START");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Simulation State
  const [source, setSource] = useState<Location>({ text: "", lat: 0, lng: 0 });
  const [destination, setDestination] = useState<Location>({ text: "", lat: 0, lng: 0 });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSearching, setIsSearching] = useState(false);
  const [pickingType, setPickingType] = useState<"source" | "destination">("source");
  const [isReturnLeg, setIsReturnLeg] = useState(false);
  const [outboundSelection, setOutboundSelection] = useState<{ result: SearchResult; timing: SearchTiming } | null>(
    null,
  );
  const [returnSelection, setReturnSelection] = useState<{ result: SearchResult; timing: SearchTiming } | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  const [roundTripResponse, setRoundTripResponse] = useState<RoundTripBookingResponse | null>(null);
  const [bookingDetails, setBookingDetails] = useState<import("./types/search").BookingDetails | null>(null);
  const [changingLeg, setChangingLeg] = useState<"outbound" | "return">("outbound");
  const [historyBookingId, setHistoryBookingId] = useState<string | null>(null);

  const { addLog } = useLogs();
  const logger = useMemo(() => new SimulatorLogger(addLog), [addLog]);

  // Register logger globally for interceptors
  useEffect(() => {
    setGlobalSimulatorLogger(logger);
    (window as any).onViewBookings = () => setActiveScreen("MY_BOOKINGS" as any);

    // Dynamically load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      setGlobalSimulatorLogger(null);
      delete (window as any).onViewBookings;
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [logger]);

  const handleStartBooking = () => {
    if (!testToken) {
      logger.admin("Initiating booking sequence. Authentication is required to proceed.");
      setIsLoginModalOpen(true);
    } else {
      logger.admin("Resuming booking flow with active session.");
      setActiveScreen("SEARCH");
    }
  };

  const openLocationPicker = (type: "source" | "destination") => {
    setPickingType(type);
    setActiveScreen("LOCATION_PICKER");
    logger.admin(`Opening map to select ${type} location.`);
  };

  const handleLocationSelect = (loc: Location) => {
    if (pickingType === "source") setSource(loc);
    else setDestination(loc);
    setActiveScreen("SEARCH");
    logger.admin(`Location confirmed: ${loc.text} set as ${pickingType}.`);
  };

  const handleSearchTrigger = async (dateOverride?: Date) => {
    if (!testToken) {
      logger.error("Authentication check failed. Please sign in to continue.");
      setIsLoginModalOpen(true);
      return;
    }

    if (!source.lat || !destination.lat) {
      toast({ title: "Please select locations", variant: "destructive" });
      return;
    }

    // If date is somehow invalid, silently fall back to today
    const rawDate = dateOverride ?? selectedDate;
    const dateToSearch = rawDate instanceof Date && !isNaN(rawDate.getTime()) ? rawDate : new Date();

    setIsSearching(true);
    logger.admin(`Searching for available trips on ${format(dateToSearch, "PPP")}.`);

    try {
      const results = await searchApi.searchTrips({
        pickupLat: source.lat,
        pickupLng: source.lng,
        dropoffLat: destination.lat,
        dropoffLng: destination.lng,
        tripDate: format(dateToSearch, "yyyy-MM-dd"),
        userLat: source.lat,
        userLng: source.lng,
      });

      setSearchResults(results);
      logger.admin(`Analysis complete. Found ${results.length} valid route options for your journey.`);
      setActiveScreen("RESULTS");
    } catch (error: any) {
      // API Error already logged by interceptor
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const fetchBookingDetails = async (bookingId: string) => {
    setIsSearching(true);
    logger.admin(`Fetching consolidated journey data for booking: ${bookingId.split("-")[0]}...`);
    try {
      const details = await searchApi.getBookingDetails(bookingId, source.lat, source.lng);
      setBookingDetails(details);
      logger.admin("Confirmation data synchronized with server.");
      return details;
    } catch (error: any) {
      toast({ title: "Failed to load details", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleInitiateOneWay = async () => {
    if (!outboundSelection) return;
    setIsSearching(true);
    logger.admin("Finalizing route parameters and initiating booking request...");
    try {
      const response = await searchApi.initiateBooking({
        tripId: outboundSelection.timing.tripId,
        pickupStopId: outboundSelection.result.pickup.pointId,
        dropoffStopId: outboundSelection.result.dropoff.pointId,
        totalAmount: outboundSelection.result.baseFare,
      });
      setBookingResponse(response);
      logger.success(`Booking successfully initiated! ID: ${response.bookingId.split("-")[0]}.`);
      await fetchBookingDetails(response.bookingId);
      setActiveScreen("CONFIRMATION");
    } catch (error: any) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleInitiateRoundTrip = async (returnSel: { result: SearchResult; timing: SearchTiming }) => {
    if (!outboundSelection) return;
    setIsSearching(true);
    logger.admin("Analyzing round-trip requirements. Syncing both legs...");
    try {
      const response = await searchApi.initiateRoundTrip({
        outbound: {
          tripId: outboundSelection.timing.tripId,
          pickupStopId: outboundSelection.result.pickup.pointId,
          dropoffStopId: outboundSelection.result.dropoff.pointId,
          totalAmount: outboundSelection.result.baseFare,
        },
        returnTrip: {
          tripId: returnSel.timing.tripId,
          pickupStopId: returnSel.result.pickup.pointId,
          dropoffStopId: returnSel.result.dropoff.pointId,
          totalAmount: returnSel.result.baseFare,
        },
      });
      setRoundTripResponse(response);
      logger.success("Round-trip sequence initiated successfully.");
      await fetchBookingDetails(response.outboundBookingId);
      setActiveScreen("CONFIRMATION");
    } catch (error: any) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleChangeSeat = async (seatNumber: string) => {
    const bookingId =
      changingLeg === "outbound"
        ? roundTripResponse
          ? roundTripResponse.outboundBookingId
          : bookingResponse?.bookingId
        : roundTripResponse?.returnBookingId;

    if (!bookingId) return;

    setIsSearching(true);
    logger.admin(`Processing seat relocation request for ${seatNumber}...`);
    try {
      await searchApi.changeSeat(bookingId, seatNumber);
      logger.success(`Seat update confirmed: ${seatNumber} is now reserved.`);
      await fetchBookingDetails(bookingId);
      setActiveScreen("CONFIRMATION");
    } catch (error: any) {
      toast({ title: "Operation failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleProceed = (result: SearchResult, timing: SearchTiming) => {
    if (!isReturnLeg) {
      setOutboundSelection({ result, timing });
      logger.admin(
        `Outbound leg selected: ${result.routeName} departing at ${format(new Date(timing.pickupArrivalTime), "h:mm a")}.`,
      );
      setActiveScreen("OPTIONS");
    } else {
      setReturnSelection({ result, timing });
      logger.admin(
        `Return leg selected: ${result.routeName} departing at ${format(new Date(timing.pickupArrivalTime), "h:mm a")}.`,
      );
      handleInitiateRoundTrip({ result, timing });
    }
  };

  const handlePayment = async () => {
    const bookingId = roundTripResponse ? roundTripResponse.outboundBookingId : bookingResponse?.bookingId;
    if (!bookingId) return;

    logger.admin("Initiating payment gateway sequence...");
    setIsSearching(true);

    try {
      const response = await searchApi.confirmPayment(bookingId, {
        paymentMethod: "RAZORPAY",
        returnBookingId: roundTripResponse?.returnBookingId,
      });

      if (response.status === "PENDING_GATEWAY" && response.gatewayData) {
        // Use the key provided by the backend to avoid 401 Unauthorized
        const { gatewayOrderId, razorpayKeyId, amount, currency } = response.gatewayData;
        logger.admin(`Gateway handshake successful. Order: ${gatewayOrderId}`);

        const options = {
          key: razorpayKeyId, // Dynamic key from backend
          amount: Math.round(Number(amount) * 100), // Convert to paise
          currency: currency || "INR",
          name: "SwapRide",
          description: "Trip Booking",
          order_id: gatewayOrderId,
          handler: function (res: any) {
            logger.success("Payment authorized by gateway.");
            logger.admin(`Gateway Ref: ${res.razorpay_payment_id}`);
            setActiveScreen("SUCCESS" as any);
          },
          modal: {
            ondismiss: function () {
              logger.error("Payment modal closed by user.");
              setIsSearching(false);
            },
          },
          prefill: {
            name: "Test User",
            email: "test@swapride.com",
            contact: "9999999999",
          },
          theme: { color: "#FFC107" },
        };

        logger.admin("Launching Razorpay SDK UI...");
        const Razorpay = (window as any).Razorpay;
        if (!Razorpay) {
          logger.error("Razorpay SDK not found on window. Retrying script load...");
          throw new Error("Razorpay SDK not loaded. Please wait a moment and try again.");
        }
        const rzp = new Razorpay(options);
        rzp.on("payment.failed", function (res: any) {
          logger.error(`Gateway error: ${res.error.description}`);
          toast({ title: "Payment Failed", description: res.error.description, variant: "destructive" });
        });
        rzp.open();
      } else if (response.status === "SUCCESS") {
        logger.success("Direct payment processed successfully.");
        setActiveScreen("SUCCESS" as any);
      }
    } catch (error: any) {
      toast({ title: "Payment failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <FullPageLoader show={isSearching} label="Broadcasting Request..." />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        logger={logger}
        description="Sign in to start the automated booking simulation"
        onSuccess={(tokens) => {
          setTestToken(tokens.accessToken);
          addLog("Authenticated successfully. Resuming simulation.", "success");
        }}
      />

      <div className="flex-1 h-full flex justify-center items-start">
        <div className="w-full max-w-[375px] h-full bg-white shadow-xl rounded-[3rem] overflow-hidden relative flex flex-col border border-slate-200">
          {activeScreen === "START" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-primary/5 to-white">
              <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 ring-8 ring-primary/5 animate-pulse">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tighter mb-3">Booking Simulator</h3>
              <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                Experience the complete inter-state travel booking journey from search to confirmation.
              </p>
              <Button
                onClick={handleStartBooking}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base rounded-2xl shadow-sm shadow-primary/10 transition-all active:scale-[0.98] group"
              >
                Start Booking
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ) : activeScreen === "LOCATION_PICKER" ? (
            <LocationPickerScreen
              pickingType={pickingType}
              onBack={() => setActiveScreen("SEARCH")}
              onSelect={handleLocationSelect}
            />
          ) : activeScreen === "RESULTS" ? (
            <SearchResultsScreen
              source={source}
              destination={destination}
              selectedDate={selectedDate}
              onBack={() => {
                if (isReturnLeg) {
                  setIsReturnLeg(false);
                  const currentSource = source;
                  const currentDest = destination;
                  setSource(currentDest);
                  setDestination(currentSource);
                  setActiveScreen("OPTIONS");
                } else {
                  setActiveScreen("SEARCH");
                }
              }}
              onProceed={handleProceed}
              results={searchResults}
              isLoading={isSearching}
              onDateChange={(date) => {
                setSelectedDate(date);
                handleSearchTrigger(date);
              }}
              isReturnLeg={isReturnLeg}
              onSwap={() => {
                const tmp = source;
                setSource(destination);
                setDestination(tmp);
                addLog("Locations swapped. Tap Search to find new trips.", "info");
              }}
              onSearch={() => handleSearchTrigger(selectedDate instanceof Date ? selectedDate : new Date())}
            />
          ) : activeScreen === "OPTIONS" ? (
            <BookingOptionsScreen
              onBack={() => setActiveScreen("RESULTS")}
              price={outboundSelection?.result.baseFare}
              onProceedOneWay={() => {
                handleInitiateOneWay();
              }}
              onShowReturnBuses={() => {
                addLog("Return trip requested. Swapping routes...", "info");
                const currentSource = source;
                const currentDest = destination;
                setSource(currentDest);
                setDestination(currentSource);
                setIsReturnLeg(true);
                handleSearchTrigger();
              }}
            />
          ) : activeScreen === "CONFIRMATION" ? (
            <ConfirmBookingScreen
              outbound={outboundSelection!}
              returnTrip={returnSelection || undefined}
              bookingResponse={bookingResponse}
              roundTripResponse={roundTripResponse}
              bookingDetails={bookingDetails}
              onBack={() => {
                if (roundTripResponse) {
                  const currentSource = source;
                  const currentDest = destination;
                  setSource(currentDest);
                  setDestination(currentSource);
                  setIsReturnLeg(true);
                  setActiveScreen("RESULTS");
                } else {
                  setActiveScreen("OPTIONS");
                }
              }}
              onConfirm={handlePayment}
              onChangeSeat={(leg) => {
                setChangingLeg(leg);
                setActiveScreen("SEAT_SELECTION");
              }}
            />
          ) : activeScreen === "SEAT_SELECTION" ? (
            <SeatSelectionScreen
              onBack={() => setActiveScreen("CONFIRMATION")}
              onConfirm={handleChangeSeat}
              tripId={changingLeg === "outbound" ? outboundSelection?.timing.tripId : returnSelection?.timing.tripId}
              initialSeat={
                changingLeg === "outbound"
                  ? roundTripResponse
                    ? roundTripResponse.outbound.assignedSeats[0]?.seatNumber
                    : bookingResponse?.assignedSeats[0]?.seatNumber
                  : roundTripResponse?.return.assignedSeats[0]?.seatNumber
              }
            />
          ) : activeScreen === ("MY_BOOKINGS" as any) ? (
            <MyBookingsScreen
              onBack={() => setActiveScreen("SEARCH")}
              logger={logger}
              onViewTicket={(id) => {
                setHistoryBookingId(id);
                setActiveScreen("TICKET_DETAIL" as any);
              }}
            />
          ) : activeScreen === ("TICKET_DETAIL" as any) ? (
            <TicketDetailScreen
              bookingId={historyBookingId!}
              onBack={() => setActiveScreen("MY_BOOKINGS" as any)}
              logger={logger}
            />
          ) : activeScreen === ("SUCCESS" as any) ? (
            <BookingSuccessScreen
              onViewTicket={() => {
                const id = roundTripResponse ? roundTripResponse.outboundBookingId : bookingResponse?.bookingId;
                if (id) {
                  setHistoryBookingId(id);
                  setActiveScreen("TICKET_DETAIL" as any);
                } else {
                  setActiveScreen("MY_BOOKINGS" as any);
                }
              }}
            />
          ) : (
            <SearchScreen
              source={source}
              setSource={setSource}
              destination={destination}
              setDestination={setDestination}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onBack={() => setActiveScreen("START")}
              onSearch={handleSearchTrigger}
              onOpenPicker={openLocationPicker}
            />
          )}
        </div>
      </div>
    </>
  );
}
