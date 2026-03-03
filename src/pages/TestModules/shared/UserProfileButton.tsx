/**
 * Floating User Profile Button
 *
 * A persistent 50×50 floating button shown when the test user is logged in.
 * Click to open a popover with Profile details and Logout option.
 */
import { useState, useEffect, useRef } from "react";
import { User, LogOut, ChevronRight, Mail, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEST_USER_TOKEN_KEY, TEST_USER_REFRESH_TOKEN_KEY } from "../types";
import { testApiClient } from "./test-api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { useLogs } from "./LogContext";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
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
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

    window.addEventListener("storage", sync);
    window.addEventListener("test-user-logged-in", (e: any) => {
      const newToken = e.detail?.accessToken || localStorage.getItem(TEST_USER_TOKEN_KEY);
      setToken(newToken);
      fetchProfile(true); // Silent fetch
    });
    window.addEventListener("test-session-expired", () => {
      setToken(null);
      setProfile(null);
    });

    if (token) fetchProfile(true); // Initial silent fetch

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("test-user-logged-in", sync);
      window.removeEventListener("test-session-expired", sync);
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
    if (!silent) setShowProfile(true);
    if (profile && !silent) return;
    if (isLoading) return;

    if (!silent) addLog("Fetching test user profile details...", "request");
    setIsLoading(true);
    try {
      const response = await testApiClient.get(API_ENDPOINTS.TEST.USER.ME);
      const data = response.data;
      setProfile({
        id: data.id ?? "-",
        fullName: data.fullName ?? "Test User",
        email: data.email ?? "-",
        mobileNumber: data.mobileNumber ?? "-",
        walletBalance: data.walletBalance,
        isVerified: data.isVerified,
        profileUrl: data.profileUrl,
      });
    } catch {
      if (!silent) setProfile({ id: "-", fullName: "Test User", email: "-", mobileNumber: "-" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TEST_USER_TOKEN_KEY);
    localStorage.removeItem(TEST_USER_REFRESH_TOKEN_KEY);
    setToken(null);
    setMenuOpen(false);
    setProfile(null);
    setShowProfile(false);
    onLogout?.();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    setIsLoading(true);
    try {
      // Note: Don't set Content-Type header manually to allow boundary creation
      const response = await testApiClient.patch(API_ENDPOINTS.TEST.USER.UPDATE_PROFILE, formData);
      const updatedUser = response.data;

      const newProfileUrl = updatedUser.profileUrl ? `${updatedUser.profileUrl}?t=${Date.now()}` : undefined;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              profileUrl: newProfileUrl,
              fullName: updatedUser.fullName,
              email: updatedUser.email,
              mobileNumber: updatedUser.mobileNumber,
            }
          : null,
      );
    } catch (err) {
      console.error("Failed to upload profile picture", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div ref={menuRef} className="relative">
      {/* ── Profile Details Panel ──────────────────────────────── */}
      {showProfile && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-5 py-5 relative">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-3 right-3 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors z-10"
            >
              <X className="h-3 w-3 text-white" />
            </button>

            {isLoading && !profile ? (
              <div className="animate-pulse">
                <div className="h-14 w-14 rounded-2xl mb-3 bg-white/20" />
                <div className="h-5 w-32 bg-white/20 rounded mb-1" />
                <div className="h-3 w-24 bg-white/10 rounded" />
              </div>
            ) : profile ? (
              <>
                {/* Avatar - Click to update */}
                <div
                  onClick={handleAvatarClick}
                  className="h-14 w-14 rounded-2xl mb-3 ring-4 ring-white/20 overflow-hidden bg-white/20 flex items-center justify-center cursor-pointer hover:ring-white/40 transition-all group relative"
                >
                  {profile.profileUrl ? (
                    <img
                      src={profile.profileUrl}
                      alt={profile.fullName}
                      className="h-full w-full object-cover group-hover:opacity-75"
                    />
                  ) : (
                    <User className="h-7 w-7 text-white" />
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {/* Hidden File Input */}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <p className="text-white font-black text-[17px] leading-tight">{profile.fullName}</p>
                <p className="text-blue-200 text-[11px] font-bold mt-0.5 uppercase tracking-wider">Test User Account</p>
              </>
            ) : null}
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            {isLoading && !profile ? (
              <>
                <div className="h-12 bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-50 rounded-xl animate-pulse" />
              </>
            ) : profile ? (
              <>
                <DetailRow icon={<Mail className="h-3.5 w-3.5 text-blue-600" />} label="Email" value={profile.email} />
                <DetailRow
                  icon={<Phone className="h-3.5 w-3.5 text-blue-600" />}
                  label="Mobile"
                  value={profile.mobileNumber}
                />
                {profile.walletBalance !== undefined && (
                  <DetailRow
                    icon={<span className="text-[11px] font-black text-blue-600">₹</span>}
                    label="Wallet"
                    value={`₹${profile.walletBalance}`}
                  />
                )}
              </>
            ) : null}
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="w-full h-10 bg-red-50 hover:bg-red-100 text-red-600 font-black text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── Mini Menu ─────────────────────────────────────────── */}
      {menuOpen && !showProfile && (
        <div className="absolute bottom-16 right-0 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-150">
          <button
            onClick={() => {
              fetchProfile();
              setMenuOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
            disabled={isLoading}
          >
            <span className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-blue-600" />
              Profile
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </button>
          <div className="h-px bg-slate-100" />
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
        onClick={() => {
          setMenuOpen((v) => !v);
          setShowProfile(false);
        }}
        className={cn(
          "h-[50px] w-[50px] rounded-full shadow-xl overflow-hidden flex items-center justify-center transition-all duration-300",
          "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95",
          "ring-4 ring-blue-600/20",
          menuOpen && "ring-4 ring-blue-600/40 scale-105",
        )}
        title="User Account"
      >
        {profile?.profileUrl ? (
          <img src={profile.profileUrl} alt={profile.fullName} className="h-full w-full object-cover" />
        ) : (
          <User className="h-5 w-5 text-white" />
        )}
      </button>
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
