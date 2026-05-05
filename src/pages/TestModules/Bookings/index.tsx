import { useState } from "react";
import { ChevronRight, User as UserIcon, MapPin, Bookmark, X } from "lucide-react";
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
import { useEffect, useMemo, useCallback } from "react";
import { profileApi } from "../Profile/api/profile";
import { UserProfile } from "../Profile/types";
import { savedLocationsApi, SavedLocation, RecentSearch } from "./api/saved-locations";
import { authApi } from "./api/auth";

// Auth Components
import { PhoneEntryScreen } from "./components/Auth/PhoneEntryScreen";
import { OtpVerifyScreen } from "./components/Auth/OtpVerifyScreen";
import { RegistrationScreen } from "./components/Auth/RegistrationScreen";
import { PasswordLoginScreen } from "./components/Auth/PasswordLoginScreen";

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
import TransactionHistoryScreen from "./features/wallet/TransactionHistoryScreen";
import TransactionDetailScreen from "./features/wallet/TransactionDetailScreen";
import { SavedLocationsScreen } from "./components/SavedLocationsScreen";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Saved Locations flow
  const [locationPickerPurpose, setLocationPickerPurpose] = useState<"search" | "add" | "edit" | "edit_modal">("search");
  const [editingSavedLocation, setEditingSavedLocation] = useState<SavedLocation | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalDraft, setEditModalDraft] = useState<{
    address: string;
    latitude: number;
    longitude: number;
    label: string;
  } | null>(null);
  const [savedLocationsRefreshTrigger, setSavedLocationsRefreshTrigger] = useState(0);
  const [savingEditModal, setSavingEditModal] = useState(false);
  const [pendingSaveLocation, setPendingSaveLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [saveAsLabel, setSaveAsLabel] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);

  // Auth Flow State
  const [authMobile, setAuthMobile] = useState("");
  const [authVerificationId, setAuthVerificationId] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

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
      setActiveScreen("AUTH_PHONE");
    } else {
      logger.admin("Resuming simulation for active user session.");
      await fetchProfile(true);
    }
  };

  const handleLoginSuccess = async (tokens: { accessToken: string; refreshToken?: string }) => {
    setTestToken(tokens.accessToken);
    localStorage.setItem(TEST_USER_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(TEST_USER_REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    window.dispatchEvent(
      new CustomEvent("test-user-logged-in", {
        detail: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      }),
    );
    addLog("Authenticated. Synchronizing user state...", "success");
    await fetchProfile(true);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TEST_USER_TOKEN_KEY);
    localStorage.removeItem(TEST_USER_REFRESH_TOKEN_KEY);
    setTestToken(null);
    setUserProfile(null);
    setActiveScreen("START");
    addLog("Session terminated. User logged out.", "info");
    toast({ title: "Logged out successfully" });
  }, [addLog]);

  // Token expiry / logout: sync simulator state and go to START (login)
  useEffect(() => {
    const onSessionExpired = () => {
      toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
      handleLogout();
    };
    const onUserLoggedOut = () => {
      handleLogout();
    };
    window.addEventListener("test-session-expired", onSessionExpired);
    window.addEventListener("test-user-logged-out", onUserLoggedOut);
    return () => {
      window.removeEventListener("test-session-expired", onSessionExpired);
      window.removeEventListener("test-user-logged-out", onUserLoggedOut);
    };
  }, [handleLogout]);

  // Protected screens: if no token and not on START/auth screens, redirect to START
  const authScreens = ["START", "AUTH_PHONE", "AUTH_OTP", "AUTH_REGISTER", "AUTH_LOGIN"];
  useEffect(() => {
    if (!testToken && !authScreens.includes(activeScreen)) {
      setActiveScreen("START");
    }
  }, [testToken, activeScreen]);

  // Auth Flow Handlers
  const handleSendOtp = async (mobile: string) => {
    setIsAuthLoading(true);
    try {
      await authApi.sendOtp(mobile);
      setAuthMobile(mobile);
      setActiveScreen("AUTH_OTP");
      addLog(`OTP sent to ${mobile}. Waiting for verification...`, "success");
    } catch (err: any) {
      toast({ title: "Failed to send OTP", description: err.message, variant: "destructive" });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setIsAuthLoading(true);
    try {
      const res = await authApi.verifyOtp(authMobile, otp);
      if (res.accessToken) {
        // Existing user login
        await handleLoginSuccess({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      } else if (res.verificationId) {
        // New user registration
        setAuthVerificationId(res.verificationId);
        setActiveScreen("AUTH_REGISTER");
      }
    } catch (err: any) {
      toast({ title: "Invalid OTP", description: err.message, variant: "destructive" });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (fullName: string, email: string, pass: string) => {
    setIsAuthLoading(true);
    try {
      const res = (await authApi.register({
        verificationId: authVerificationId,
        fullName,
        email,
        password: pass,
      })) as any;
      await handleLoginSuccess({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handlePasswordLogin = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    try {
      const res = (await authApi.login({ identifier: email, password: pass })) as any;
      await handleLoginSuccess({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAuthLoading(false);
    }
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
    if (locationPickerPurpose === "add") {
      setPendingSaveLocation({
        address: loc.text || loc.address || "",
        latitude: loc.lat,
        longitude: loc.lng,
      });
      setSaveAsLabel("");
      return;
    }
    if (locationPickerPurpose === "edit_modal") {
      setEditModalDraft((d) =>
        d ? { ...d, address: loc.text || loc.address || "", latitude: loc.lat, longitude: loc.lng } : d,
      );
      setLocationPickerPurpose("search");
      setActiveScreen("SAVED_LOCATIONS");
      setEditModalOpen(true);
      return;
    }
    if (pickingType === "source") setSource(loc);
    else setDestination(loc);
    setActiveScreen("SEARCH");
    logger.admin(`Location confirmed: ${loc.text} set as ${pickingType}.`);
  };

  const handleSaveAsConfirm = async () => {
    if (!pendingSaveLocation || !saveAsLabel.trim()) return;
    setSavingLocation(true);
    try {
      await savedLocationsApi.create({
        label: saveAsLabel.trim(),
        address: pendingSaveLocation.address,
        latitude: pendingSaveLocation.latitude,
        longitude: pendingSaveLocation.longitude,
      });
      setPendingSaveLocation(null);
      setSaveAsLabel("");
      setLocationPickerPurpose("search");
      setActiveScreen("SAVED_LOCATIONS");
      toast({ title: "Location saved" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSavingLocation(false);
    }
  };

  const handleSearchTrigger = async (
    startTime?: string,
    endTime?: string,
    dateOverride?: Date,
    sourceOverride?: Partial<AppLocation> & { lat: number | null; lng: number | null; text: string },
    destOverride?: Partial<AppLocation> & { lat: number | null; lng: number | null; text: string },
    preferredTime?: string,
  ) => {
    const finalSource: AppLocation = sourceOverride
      ? { ...source, ...sourceOverride, lat: sourceOverride.lat ?? source.lat, lng: sourceOverride.lng ?? source.lng, text: sourceOverride.text }
      : source;
    const finalDestination: AppLocation = destOverride
      ? { ...destination, ...destOverride, lat: destOverride.lat ?? destination.lat, lng: destOverride.lng ?? destination.lng, text: destOverride.text }
      : destination;
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
          address: finalSource.address ?? finalSource.text,
          placeName: finalSource.placeName ?? (finalSource.text || undefined),
        },
        dropoff: {
          latitude: finalDestination.lat!,
          longitude: finalDestination.lng!,
          address: finalDestination.address ?? finalDestination.text,
          placeName: finalDestination.placeName ?? (finalDestination.text || undefined),
        },
        userLocation: {
          latitude: finalSource.lat!,
          longitude: finalSource.lng!,
        },
        tripDate: format(dateToSearch, "yyyy-MM-dd"),
        officeTimings: userProfile?.isOnboarded === false ? `${finalStartTime} - ${finalEndTime}` : undefined,
        preferredTime: preferredTime,
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
      const details = await searchApi.getBookingDetails(bookingId, source.lat, source.lng, destination.lat, destination.lng);
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
              onSavedLocationsClick={() => setActiveScreen("SAVED_LOCATIONS")}
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
              onViewAll={() => setActiveScreen("TRANSACTION_HISTORY" as any)}
            />
          ) : activeScreen === ("TRANSACTION_HISTORY" as any) ? (
            <TransactionHistoryScreen
              onBack={() => setActiveScreen("WALLET")}
              onTransactionClick={(id) => {
                setSelectedTransactionId(id);
                setActiveScreen("TRANSACTION_DETAIL" as any);
              }}
            />
          ) : activeScreen === ("TRANSACTION_DETAIL" as any) && selectedTransactionId ? (
            <TransactionDetailScreen
              transactionId={selectedTransactionId}
              onBack={() => setActiveScreen("TRANSACTION_HISTORY" as any)}
            />
          ) : activeScreen === "SAVED_LOCATIONS" ? (
            <SavedLocationsScreen
              refreshTrigger={savedLocationsRefreshTrigger}
              onBack={() => setActiveScreen("HOME")}
              onAddLocation={() => {
                setLocationPickerPurpose("add");
                setPickingType("source");
                setActiveScreen("LOCATION_PICKER");
              }}
              onEditLocation={(loc) => {
                setEditingSavedLocation(loc);
                setEditModalDraft({
                  address: loc.address,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  label: loc.label,
                });
                setEditModalOpen(true);
              }}
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
              onBack={() => {
                if (locationPickerPurpose === "add" || locationPickerPurpose === "edit") {
                  setLocationPickerPurpose("search");
                  setEditingSavedLocation(null);
                  setActiveScreen("SAVED_LOCATIONS");
                } else if (locationPickerPurpose === "edit_modal") {
                  setLocationPickerPurpose("search");
                  setEditModalOpen(true);
                  setActiveScreen("SAVED_LOCATIONS");
                } else {
                  setActiveScreen("SEARCH");
                }
              }}
              onSelect={handleLocationSelect}
              savedLocations={locationPickerPurpose === "search" || locationPickerPurpose === "edit_modal" ? savedLocations : []}
              recentSearches={locationPickerPurpose === "search" || locationPickerPurpose === "edit_modal" ? recentSearches : []}
              editingLocation={locationPickerPurpose === "edit" ? editingSavedLocation : null}
              onUpdateLocation={(id, loc) => {
                savedLocationsApi
                  .update(id, loc)
                  .then(() => {
                    setEditingSavedLocation(null);
                    setLocationPickerPurpose("search");
                    setActiveScreen("SAVED_LOCATIONS");
                    toast({ title: "Location updated" });
                  })
                  .catch((err) => toast({ title: "Update failed", description: err.message, variant: "destructive" }));
              }}
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
              onShowReturnBuses={(time) => {
                addLog("Return trip requested. Swapping routes...", "info");
                const currentSource = source;
                const currentDest = destination;
                setSource(currentDest);
                setDestination(currentSource);
                setIsReturnLeg(true);
                handleSearchTrigger(undefined, undefined, undefined, currentDest, currentSource, time);
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
              onApplyCoupon={async (code) => {
                const bookingId = roundTripResponse ? roundTripResponse.outboundBookingId : bookingResponse?.bookingId;
                if (!bookingId) return { success: false, message: "No active booking found" };
                try {
                  await searchApi.applyCoupon(bookingId, code, roundTripResponse?.returnBookingId);
                  logger.success(`Coupon ${code} applied successfully.`);
                  await fetchBookingDetails(bookingId);
                  return { success: true };
                } catch (err: any) {
                  const message = err.response?.data?.message || err.message || "Failed to apply coupon";
                  // toast({ title: "Failed to apply coupon", description: message, variant: "destructive" });
                  return { success: false, message };
                }
              }}
              onRemoveCoupon={async () => {
                const bookingId = roundTripResponse ? roundTripResponse.outboundBookingId : bookingResponse?.bookingId;
                if (!bookingId) return;
                try {
                  await searchApi.removeCoupon(bookingId, roundTripResponse?.returnBookingId);
                  logger.admin("Coupon removed.");
                  await fetchBookingDetails(bookingId);
                } catch (err: any) {
                  toast({ title: "Failed to remove coupon", description: err.message, variant: "destructive" });
                }
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
          ) : activeScreen === "AUTH_PHONE" ? (
            <PhoneEntryScreen onSendOtp={handleSendOtp} isLoading={isAuthLoading} />
          ) : activeScreen === "AUTH_OTP" ? (
            <OtpVerifyScreen
              mobileNumber={authMobile}
              onVerify={handleVerifyOtp}
              onResend={() => handleSendOtp(authMobile)}
              onCancel={() => setActiveScreen("AUTH_PHONE")}
              isLoading={isAuthLoading}
            />
          ) : activeScreen === "AUTH_REGISTER" ? (
            <RegistrationScreen
              onRegister={handleRegister}
              onCancel={() => setActiveScreen("AUTH_PHONE")}
              isLoading={isAuthLoading}
            />
          ) : activeScreen === "AUTH_LOGIN" ? (
            <PasswordLoginScreen
              onLogin={handlePasswordLogin}
              onBackToPhone={() => setActiveScreen("AUTH_PHONE")}
              isLoading={isAuthLoading}
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

      <Dialog
        open={editModalOpen && !!editingSavedLocation && !!editModalDraft}
        onOpenChange={(open) => {
          if (!open) {
            setEditModalOpen(false);
            setEditingSavedLocation(null);
            setEditModalDraft(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <DialogTitle className="text-lg">Edit Location</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full -mr-2"
              onClick={() => {
                setEditModalOpen(false);
                setEditingSavedLocation(null);
                setEditModalDraft(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                <MapPin className="h-3.5 w-3.5" />
                Location
              </label>
              <button
                type="button"
                className="w-full text-left text-sm mt-1 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors truncate"
                onClick={() => {
                  setEditModalOpen(false);
                  setLocationPickerPurpose("edit_modal");
                  setPickingType("source");
                  setActiveScreen("LOCATION_PICKER");
                }}
              >
                {editModalDraft?.address || "Select location"}
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                <Bookmark className="h-3.5 w-3.5" />
                Save as
              </label>
              <Input
                placeholder="e.g. Home, Office"
                value={editModalDraft?.label ?? ""}
                onChange={(e) =>
                  setEditModalDraft((d) => (d ? { ...d, label: e.target.value } : null))
                }
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="rounded-xl w-full"
              disabled={savingEditModal || !editModalDraft?.label?.trim()}
              onClick={async () => {
                if (!editingSavedLocation || !editModalDraft) return;
                setSavingEditModal(true);
                try {
                  await savedLocationsApi.update(editingSavedLocation.id, {
                    address: editModalDraft.address,
                    latitude: editModalDraft.latitude,
                    longitude: editModalDraft.longitude,
                    label: editModalDraft.label.trim(),
                  });
                  setEditModalOpen(false);
                  setEditingSavedLocation(null);
                  setEditModalDraft(null);
                  setSavedLocationsRefreshTrigger((t) => t + 1);
                  toast({ title: "Location updated" });
                } catch (err: any) {
                  toast({ title: "Update failed", description: err.message, variant: "destructive" });
                } finally {
                  setSavingEditModal(false);
                }
              }}
            >
              {savingEditModal ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingSaveLocation} onOpenChange={(open) => !open && setPendingSaveLocation(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Save as</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="text-sm mt-1 text-foreground truncate" title={pendingSaveLocation?.address}>
                {pendingSaveLocation?.address}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Save as</label>
              <Input
                placeholder="e.g. Home, Office"
                value={saveAsLabel}
                onChange={(e) => setSaveAsLabel(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingSaveLocation(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsConfirm} disabled={!saveAsLabel.trim() || savingLocation}>
              {savingLocation ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
