import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TEST_USER_TOKEN_KEY } from "../types";
import { LoginModal } from "../shared/LoginModal";
import { useLogs } from "../shared/LogContext";
import { SimulatorLogger, setGlobalSimulatorLogger } from "../shared/SimulatorLogger";
import { profileApi } from "./api/profile";
import { ProfileScreen } from "./components/ProfileScreen";
import { UserProfile, UpdateProfileRequest } from "./types";

export default function ProfileModule() {
  const [testToken, setTestToken] = useState<string | null>(localStorage.getItem(TEST_USER_TOKEN_KEY));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const { addLog } = useLogs();
  const logger = useMemo(() => new SimulatorLogger(addLog), [addLog]);

  // Register logger globally for interceptors
  useEffect(() => {
    setGlobalSimulatorLogger(logger);
    return () => setGlobalSimulatorLogger(null);
  }, [logger]);

  useEffect(() => {
    if (!testToken) {
      setIsLoginModalOpen(true);
      setIsLoading(false);
    } else {
      fetchProfile();
    }
  }, [testToken]);

  const fetchProfile = async () => {
    setIsLoading(true);
    addLog("Fetching test user profile...", "request");
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
      addLog("Profile fetched successfully", "response");
    } catch (error: any) {
      logger.error("Failed to fetch profile");
      if (error.response?.status === 401) {
        setIsLoginModalOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (dto: UpdateProfileRequest) => {
    addLog("Initiating profile update...", "request");
    try {
      const updatedProfile = await profileApi.updateProfile(dto);
      setProfile(updatedProfile);
      addLog("Profile updated successfully", "response");
      toast({
        title: "Profile Updated",
        description: "Your profile details have been saved successfully.",
      });
      // Trigger a refresh event for components like UserProfileButton
      window.dispatchEvent(
        new CustomEvent("test-user-logged-in", {
          detail: { accessToken: testToken },
        }),
      );
    } catch (error: any) {
      logger.error(error.response?.data?.message || "Update failed");
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Could not update profile.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {profile ? (
        <ProfileScreen profile={profile} onUpdate={handleUpdate} onBack={() => window.history.back()} />
      ) : (
        <div className="text-center space-y-4">
          <p className="text-slate-500">Authentication required to view profile.</p>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg font-bold"
          >
            Login to Simulator
          </button>
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        logger={logger}
        onSuccess={(tokens) => {
          localStorage.setItem(TEST_USER_TOKEN_KEY, tokens.accessToken);
          setTestToken(tokens.accessToken);
          setIsLoginModalOpen(false);
        }}
      />
    </div>
  );
}
