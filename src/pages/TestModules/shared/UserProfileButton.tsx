/**
 * Floating User Profile Button
 *
 * A persistent 50×50 floating button shown when the test user is logged in.
 * Click to open a popover with Profile details and Logout option.
 */
import { useState, useEffect, useRef } from "react";
import {
  User,
  LogOut,
  ChevronRight,
  UserSquare2,
  Loader2,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TEST_USER_TOKEN_KEY, TEST_USER_REFRESH_TOKEN_KEY } from "../types";
import { testApiClient } from "./test-api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { useLogs } from "./LogContext";
import { ProfileScreen } from "../Profile/components/ProfileScreen";
import { UpdateProfileRequest } from "../Profile/types";
import { profileApi } from "../Profile/api/profile";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TravelPreferencesScreen, TravelPreferences } from "../TravelPreferences/components/TravelPreferencesScreen";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string | null;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  walletBalance?: number;
  isVerified?: boolean;
  profileUrl?: string;
}

interface UserProfileButtonProps {
  onLogout?: () => void;
}

export function UserProfileButton({ onLogout }: UserProfileButtonProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TEST_USER_TOKEN_KEY));
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTravelPrefsModalOpen, setIsTravelPrefsModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [travelPrefs, setTravelPrefs] = useState<TravelPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addLog } = useLogs();

  // Re-check token on storage changes (cross-tab) or custom login event (same-tab)
  useEffect(() => {
    const sync = () => {
      const storedToken = localStorage.getItem(TEST_USER_TOKEN_KEY);
      setToken(storedToken);
      if (storedToken) fetchProfile(true); // Silent fetch
    };

    const onLoggedIn = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const newToken = detail?.accessToken || localStorage.getItem(TEST_USER_TOKEN_KEY);
      setToken(newToken);
      fetchProfile(true); // Silent fetch
    };

    const onSessionExpired = () => {
      setToken(null);
      setProfile(null);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("test-user-logged-in", onLoggedIn);
    window.addEventListener("test-session-expired", onSessionExpired);

    if (token) fetchProfile(true); // Initial silent fetch

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("test-user-logged-in", onLoggedIn);
      window.removeEventListener("test-session-expired", onSessionExpired);
    };
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchProfile = async (silent = false) => {
    if (profile && !silent) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await testApiClient.get(API_ENDPOINTS.TEST.USER.ME);
      const data = response.data;
      setProfile({
        id: data.id ?? "-",
        fullName: data.fullName ?? "Test User",
        email: data.email ?? "-",
        mobileNumber: data.mobileNumber ?? "-",
        gender: data.gender ?? null,
        dateOfBirth: data.dateOfBirth ?? null,
        bloodGroup: data.bloodGroup ?? null,
        walletBalance: data.walletBalance,
        isVerified: data.isVerified,
        profileUrl: data.profileUrl,
      });
    } catch {
      // Always set a fallback profile to prevent infinite loaders in the UI
      setProfile({
        id: "-",
        fullName: "Test User",
        email: "-",
        mobileNumber: "-",
        gender: null,
        dateOfBirth: null,
        bloodGroup: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (data: UpdateProfileRequest) => {
    addLog("Updating profile details...", "request");
    try {
      const updated = await profileApi.updateProfile(data);
      setProfile((prev) => (prev ? { ...prev, ...updated, walletBalance: prev.walletBalance } : null)); // Preserve walletBalance if not returned by update
      addLog("Profile updated successfully", "response");
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
      setIsModalOpen(false);
    } catch (error: any) {
      addLog(`Update failed: ${error.message}`, "error");
      toast({
        title: "Update Failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    addLog("Attempting to delete account...", "request");
    try {
      await profileApi.deleteAccount();
      addLog("Account deleted successfully", "response");
      toast({
        title: "Account Deleted",
        description: "Your account has been deactivated successfully.",
      });
      handleLogout();
    } catch (error: any) {
      addLog(`Account deletion failed: ${error.message}`, "error");
      toast({
        title: "Deletion Failed",
        description: "Could not delete account. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleOpenTravelPrefs = async () => {
    setMenuOpen(false);
    try {
      const data = await profileApi.getTravelPreferences();
      setTravelPrefs(data);
    } catch {
      toast({ title: "Failed to load travel preferences", variant: "destructive" });
      return;
    }
    setIsTravelPrefsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(TEST_USER_TOKEN_KEY);
    localStorage.removeItem(TEST_USER_REFRESH_TOKEN_KEY);
    setToken(null);
    setProfile(null);
    setMenuOpen(false);
    setIsModalOpen(false);
    setIsTravelPrefsModalOpen(false);
    window.dispatchEvent(new CustomEvent("test-user-logged-out"));
    onLogout?.();
  };

  if (!token) return null;

  return (
    <div ref={menuRef} className="relative">
      {/* ── Mini Menu ─────────────────────────────────────────── */}
      {menuOpen && (
        <div className="absolute bottom-16 right-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-150 z-50">
          <button
            onClick={() => {
              setIsModalOpen(true);
              setMenuOpen(false);
              fetchProfile(true);
            }}
            className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-50"
          >
            <span className="flex items-center gap-2.5">
              <UserSquare2 className="h-4 w-4 text-amber-600" />
              Profile
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            onClick={handleOpenTravelPrefs}
            className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-50"
          >
            <span className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-blue-500" />
              Travel Preferences
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* ── Floating Button ────────────────────────────────────── */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={cn(
          "h-[50px] w-[50px] rounded-full shadow-xl overflow-hidden flex items-center justify-center transition-all duration-300",
          "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95",
          "ring-4 ring-blue-600/20",
          menuOpen && "ring-4 ring-blue-600/40 scale-105",
        )}
        title="User Account"
      >
        {profile?.profileUrl ? (
          <img 
            src={profile.profileUrl} 
            alt={profile.fullName} 
            className="h-full w-full object-cover" 
            onError={(e) => {
              // On image load failure, remove the profileUrl so the fallback icon renders
              setProfile(prev => prev ? { ...prev, profileUrl: undefined } : null);
            }}
          />
        ) : (
          <User className="h-5 w-5 text-white" />
        )}
      </button>

      {/* ── Profile Modal ─────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-none rounded-[2rem]">
          <div className="h-[600px] flex flex-col bg-white overflow-hidden shadow-2xl border border-slate-100 rounded-[2rem]">
            {profile ? (
              <ProfileScreen
                profile={profile as any}
                onUpdate={handleUpdateProfile}
                onDelete={handleDeleteAccount}
                onBack={() => setIsModalOpen(false)}
              />
            ) : (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            )}

            {profile && (
              <div className="px-8 pb-6 pt-2 bg-white flex justify-between items-center border-t border-slate-50">
                {profile.walletBalance !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">
                      Wallet Balance
                    </span>
                    <span className="text-xl font-black text-slate-900 leading-none tracking-tight">
                      ₹{profile.walletBalance}
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-end">
                  <div className="px-3 py-1 bg-amber-50 rounded-full mb-1">
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest whitespace-nowrap">
                      Verified User
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Travel Preferences Modal */}
      <Dialog open={isTravelPrefsModalOpen} onOpenChange={setIsTravelPrefsModalOpen}>
        <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-none rounded-[2rem]">
          <div className="h-[520px] flex flex-col bg-white overflow-hidden shadow-2xl border border-slate-100 rounded-[2rem]">
            {travelPrefs ? (
              <TravelPreferencesScreen
                preferences={travelPrefs}
                onBack={() => setIsTravelPrefsModalOpen(false)}
                onUpdated={(updated) => setTravelPrefs(updated)}
              />
            ) : (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
      <div className="h-6 w-6 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-[12px] font-bold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}
