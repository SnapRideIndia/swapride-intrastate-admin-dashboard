import React, { useState } from "react";
import { Home, Briefcase, Clock, MapPin, X, Loader2, Edit3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { profileApi } from "../../Profile/api/profile";

export interface TravelPreferences {
  home: {
    id: string;
    label: string;
    address: string;
    latitude: number;
    longitude: number;
  } | null;
  office: {
    id: string;
    label: string;
    address: string;
    latitude: number;
    longitude: number;
  } | null;
  officeTimings: string | null;
}

interface TravelPreferencesScreenProps {
  preferences: TravelPreferences;
  onBack?: () => void;
  onUpdated?: (updated: TravelPreferences) => void;
}

type EditSection = "home" | "office" | "timings" | null;

export const TravelPreferencesScreen: React.FC<TravelPreferencesScreenProps> = ({ preferences, onBack, onUpdated }) => {
  const [editSection, setEditSection] = useState<EditSection>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [prefs, setPrefs] = useState<TravelPreferences>(preferences);

  // Form state for editing
  const [homeAddress, setHomeAddress] = useState(prefs.home?.address || "");
  const [officeAddress, setOfficeAddress] = useState(prefs.office?.address || "");
  const [timings, setTimings] = useState(prefs.officeTimings || "");

  const startEdit = (section: EditSection) => {
    setEditSection(section);
    if (section === "home") setHomeAddress(prefs.home?.address || "");
    if (section === "office") setOfficeAddress(prefs.office?.address || "");
    if (section === "timings") setTimings(prefs.officeTimings || "");
  };

  const cancelEdit = () => setEditSection(null);

  const saveEdit = async () => {
    setIsSaving(true);
    try {
      if (editSection === "home") {
        const result = await profileApi.updateTravelPreferences("home", {
          address: homeAddress,
          latitude: prefs.home?.latitude ?? 0,
          longitude: prefs.home?.longitude ?? 0,
        });
        const updated = { ...prefs, home: result.home };
        setPrefs(updated);
        onUpdated?.(updated);
      } else if (editSection === "office") {
        const result = await profileApi.updateTravelPreferences("office", {
          address: officeAddress,
          latitude: prefs.office?.latitude ?? 0,
          longitude: prefs.office?.longitude ?? 0,
        });
        const updated = { ...prefs, office: result.office };
        setPrefs(updated);
        onUpdated?.(updated);
      } else if (editSection === "timings") {
        await profileApi.updateTravelPreferences("timings", { timings });
        const updated = { ...prefs, officeTimings: timings };
        setPrefs(updated);
        onUpdated?.(updated);
      }
      toast({ title: "Saved", description: "Your travel preferences have been updated." });
      setEditSection(null);
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.response?.data?.message || "Could not save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Travel Preferences</h1>
        </div>
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          title="Close"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-hide">
        {/* Subtitle */}
        <p className="text-[11px] font-bold text-slate-400 -mt-1">
          This helps us find the best stops and timings for your daily commute.
        </p>

        {/* Home Address */}
        <SectionCard
          icon={<Home className="w-4 h-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Home Address"
          isEditing={editSection === "home"}
          onEdit={() => startEdit("home")}
          onCancel={cancelEdit}
          onSave={saveEdit}
          isSaving={isSaving}
          displayValue={prefs.home?.address || "Not set"}
          isEmpty={!prefs.home}
        >
          <div className="space-y-2 mt-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</Label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-none rounded-2xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-emerald-400/30"
                placeholder="Enter your home address"
              />
            </div>
          </div>
        </SectionCard>

        {/* Office Address */}
        <SectionCard
          icon={<Briefcase className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-50"
          label="Office Address"
          isEditing={editSection === "office"}
          onEdit={() => startEdit("office")}
          onCancel={cancelEdit}
          onSave={saveEdit}
          isSaving={isSaving}
          displayValue={prefs.office?.address || "Not set"}
          isEmpty={!prefs.office}
        >
          <div className="space-y-2 mt-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-none rounded-2xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-blue-400/30"
                placeholder="Enter your office address"
              />
            </div>
          </div>
        </SectionCard>

        {/* Office Timings */}
        <SectionCard
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          iconBg="bg-amber-50"
          label="Office Timings"
          isEditing={editSection === "timings"}
          onEdit={() => startEdit("timings")}
          onCancel={cancelEdit}
          onSave={saveEdit}
          isSaving={isSaving}
          displayValue={prefs.officeTimings || "Not set"}
          isEmpty={!prefs.officeTimings}
        >
          <div className="space-y-2 mt-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timings</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input
                value={timings}
                onChange={(e) => setTimings(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-none rounded-2xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-amber-400/30"
                placeholder="e.g. 9:00 AM – 6:00 PM"
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// ── Reusable Section Card ─────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  displayValue: string;
  isEmpty: boolean;
  children: React.ReactNode;
}

function SectionCard({
  icon,
  iconBg,
  label,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
  displayValue,
  isEmpty,
  children,
}: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isEditing ? "border-slate-200 bg-white shadow-md" : "border-slate-100 bg-slate-50/60"
      }`}
    >
      <div className="px-4 pt-4 pb-3">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              {!isEditing && (
                <p className={`text-sm font-bold mt-0.5 ${isEmpty ? "text-slate-300 italic" : "text-slate-700"}`}>
                  {displayValue}
                </p>
              )}
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={onEdit}
              className="p-2 rounded-xl bg-white border border-slate-100 hover:bg-slate-100 transition-colors active:scale-90"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="h-8 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </Button>
            </div>
          )}
        </div>

        {/* Inline Edit Form */}
        {isEditing && children}
      </div>
    </div>
  );
}
