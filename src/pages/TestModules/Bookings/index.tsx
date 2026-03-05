import { useState } from "react";
import { Search, ChevronRight, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { AppLocation, SimulatorScreen, TEST_USER_TOKEN_KEY, TEST_USER_REFRESH_TOKEN_KEY } from "../types";
import { SearchResult, SearchTiming, BookingResponse, RoundTripBookingResponse } from "./types/search";
import { searchApi } from "./api/search";

// Shared Components
import { LoginModal } from "../shared/LoginModal";
import { useLogs } from "../shared/LogContext";
import { SimulatorLogger, setGlobalSimulatorLogger } from "../shared/SimulatorLogger";
import { useEffect, useMemo } from "react";
import { profileApi } from "../Profile/api/profile";
import { UserProfile } from "../Profile/types";
import { savedLocationsApi, SavedLocation, RecentSearch } from "./api/saved-locations";

// Feature Components
import { UserHomeScreen } from "./components/UserHomeScreen";
import { ProfileScreen } from "../Profile/components/ProfileScreen";
import { SearchScreen } from "./components/SearchScreen";
import { LocationPickerScreen } from "./components/LocationPickerScreen";
import { SearchResultsScreen } from "./components/SearchResultsScreen";
import { BookingOptionsScreen } from "./components/BookingOptionsScreen";
import { ConfirmBookingScreen } from "./components/ConfirmBookingScreen";
import { SeatSelectionScreen } from "./components/SeatSelectionScreen";
import BookingSuccessScreen from "./components/BookingSuccessScreen";
import MyBookingsScreen from "./components/MyBookingsScreen";
import TicketDetailScreen from "./components/TicketDetailScreen";
import WalletScreen from "./features/wallet/WalletScreen";

export default function UserSimulator() {
  const [testToken, setTestToken] = useState<string | null>(localStorage.getItem(TEST_USER_TOKEN_KEY));
  const [activeScreen, setActiveScreen] = useState<SimulatorScreen>("START");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [source, setSource] = useState<AppLocation>({ text: "", lat: 0, lng: 0 });
  const [destination, setDestination] = useState<AppLocation>({ text: "", lat: 0, lng: 0 });
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
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

  // Register logger globally and handle Razorpay SDK
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

  const fetchProfile = async (shouldNavigate = false) => {
    try {
      addLog("Fetching user profile details...", "request");
      const profile = await profileApi.getProfile();
      console.log("DEBUG: User Profile Response:", profile);
      setUserProfile(profile);

      addLog("Profile data synchronized.", "success");
      if (shouldNavigate) setActiveScreen("HOME");
    } catch (error: any) {
      addLog(`Failed to fetch profile: ${error.message}`, "error");
      toast({ title: "Failed to load profile", variant: "destructive" });
    }
  };

  const handleStartSimulation = async () => {
    if (!testToken) {
      logger.admin("Initiating user simulation. Authentication required.");
      setIsLoginModalOpen(true);
    } else {
      logger.admin("Resuming simulation for active user session.");
      await fetchProfile(true);
    }
  };

  const handleLoginSuccess = async (tokens: { accessToken: string }) => {
    setTestToken(tokens.accessToken);
    addLog("Authenticated. Synchronizing user state...", "success");
    await fetchProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem(TEST_USER_TOKEN_KEY);
    localStorage.removeItem(TEST_USER_REFRESH_TOKEN_KEY);
    setTestToken(null);
    setUserProfile(null);
    setActiveScreen("START");
    addLog("Session terminated. User logged out.", "info");
    toast({ title: "Logged out successfully" });
  };

  const openLocationPicker = async (type: "source" | "destination") => {
    setPickingType(type);
    setActiveScreen("LOCATION_PICKER");
    logger.admin(`Opening map to select ${type} location.`);

    // Fetch filtered saved locations and recent searches when picker opens
    if (userProfile?.isOnboarded) {
      try {
        const [locations, searches] = await Promise.all([
          savedLocationsApi.getSavedLocations(type),
          savedLocationsApi.getRecentSearches(type),
        ]);
        setSavedLocations(locations);
        setRecentSearches(searches);
      } catch (err) {
        console.error("Failed to load filtered locations", err);
      }
    }
  };

  const handleLocationSelect = (loc: AppLocation) => {
    if (pickingType === "source") setSource(loc);
    else setDestination(loc);
    setActiveScreen("SEARCH");
    logger.admin(`Location confirmed: ${loc.text} set as ${pickingType}.`);
  };

  const handleSearchTrigger = async (
    startTime?: string,
    endTime?: string,
    dateOverride?: Date,
    sourceOverride?: { lat: number | null; lng: number | null; text: string },
    destOverride?: { lat: number | null; lng: number | null; text: string },
  ) => {
    const finalSource = sourceOverride || source;
    const finalDestination = destOverride || destination;
    const finalDate = dateOverride || selectedDate;
    const finalStartTime = startTime || "09:00 AM";
    const finalEndTime = endTime || "06:00 PM";

    if (!testToken) {
      logger.error("Authentication check failed. Please sign in to continue.");
      setIsLoginModalOpen(true);
      return;
    }

    if (!finalSource.lat || !finalDestination.lat) {
      toast({ title: "Please select locations", variant: "destructive" });
      return;
    }

    // If onboarding, always search for today. Otherwise use selected date.
    const rawDate = userProfile?.isOnboarded === false ? new Date() : (dateOverride ?? selectedDate);
    const dateToSearch = rawDate instanceof Date && !isNaN(rawDate.getTime()) ? rawDate : new Date();

    setIsSearching(true);
    if (userProfile?.isOnboarded === false) {
      logger.admin("First-time journey initiated. Synchronizing commute preferences through search...");
    } else {
      logger.admin(`Searching for available trips on ${format(dateToSearch, "PPP")}.`);
    }

    try {
      const results = await searchApi.searchTrips({
        pickup: {
          latitude: finalSource.lat!,
          longitude: finalSource.lng!,
          address: finalSource.text,
        },
        dropoff: {
          latitude: finalDestination.lat!,
          longitude: finalDestination.lng!,
          address: finalDestination.text,
        },
        userLocation: {
          latitude: finalSource.lat!,
          longitude: finalSource.lng!,
        },
        tripDate: format(dateToSearch, "yyyy-MM-dd"),
        officeTimings: userProfile?.isOnboarded === false ? `${finalStartTime} - ${finalEndTime}` : undefined,
      });

      setSearchResults(results);
      console.log("API: Search Trips Response:", results);
      logger.admin(`Analysis complete. Found ${results.length} valid route options for your journey.`);
      setActiveScreen("RESULTS");

      // If this was an onboarding search, the backend likely marked us as onboarded.
      // Refresh profile to update UI.
      if (userProfile?.isOnboarded === false) {
        await fetchProfile();
      }
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
        description="Sign in to start the automated user simulation"
        onSuccess={handleLoginSuccess}
      />

      <div className="flex-1 h-full flex justify-center items-start">
        <div className="w-full max-w-[375px] h-full bg-white shadow-xl rounded-[3rem] overflow-hidden relative flex flex-col border border-slate-200">
          {activeScreen === "START" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-primary/5 to-white">
              <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 ring-8 ring-primary/5 animate-pulse">
                <UserIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tighter mb-3">User Simulation</h3>
              <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                Step into the shoes of a passenger. Experience search, booking, and account management from start to
                finish.
              </p>
              <Button
                onClick={handleStartSimulation}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base rounded-2xl shadow-sm transition-all active:scale-[0.98] group"
              >
                Start Simulation
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ) : activeScreen === "HOME" ? (
            <UserHomeScreen
              profile={userProfile!}
              onStartBooking={() => {
                addLog("Shuttle service selected. Starting journey planner.", "info");
                setActiveScreen("SEARCH");
              }}
              onProfileClick={() => setActiveScreen("PROFILE")}
              activeTab="HOME"
              onTabChange={(tab) => {
                if (tab === "HISTORY") setActiveScreen("MY_BOOKINGS" as any);
                else setActiveScreen(tab);
              }}
            />
          ) : activeScreen === "WALLET" ? (
            <WalletScreen
              onBack={() => setActiveScreen("HOME")}
              logger={logger}
              onRefreshProfile={() => fetchProfile(false)}
            />
          ) : activeScreen === "PROFILE" ? (
            <div className="flex-1 flex flex-col h-full bg-white">
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <ProfileScreen
                  profile={userProfile!}
                  onBack={() => setActiveScreen("HOME")}
                  onUpdate={async (data) => {
                    await profileApi.updateProfile(data);
                    await fetchProfile();
                    setActiveScreen("HOME");
                  }}
                  onDelete={async () => {
                    await profileApi.deleteAccount();
                    handleLogout();
                  }}
                />
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <Button
                  variant="destructive"
                  className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : activeScreen === "LOCATION_PICKER" ? (
            <LocationPickerScreen
              pickingType={pickingType}
              onBack={() => setActiveScreen("SEARCH")}
              onSelect={handleLocationSelect}
              savedLocations={savedLocations}
              recentSearches={recentSearches}
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
                handleSearchTrigger(undefined, undefined, date);
              }}
              isReturnLeg={isReturnLeg}
              onSwap={() => {
                const tmp = source;
                setSource(destination);
                setDestination(tmp);
                addLog("Locations swapped. Tap Search to find new trips.", "info");
              }}
              onSearch={() =>
                handleSearchTrigger(undefined, undefined, selectedDate instanceof Date ? selectedDate : new Date())
              }
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
                handleSearchTrigger(undefined, undefined, undefined, currentDest, currentSource);
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
          ) : activeScreen === ("MY_BOOKINGS" as any) || activeScreen === "HISTORY" ? (
            <MyBookingsScreen
              onBack={() => setActiveScreen("HOME")}
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
              onBack={() => setActiveScreen("HOME")}
              onSearch={handleSearchTrigger}
              onOpenPicker={openLocationPicker}
              isOnboarded={userProfile?.isOnboarded}
              savedLocations={savedLocations}
              recentSearches={recentSearches}
            />
          )}
        </div>
      </div>
    </>
  );
}
