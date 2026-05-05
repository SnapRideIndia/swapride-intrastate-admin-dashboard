import React, { useState, useRef } from "react";
import {
  User,
  Phone,
  Mail,
  UserSquare2,
  Calendar as CalendarIcon,
  Camera,
  Loader2,
  X,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { UserProfile, UpdateProfileRequest } from "../types";
import { profileSchema, ProfileFormValues } from "../schemas/profile.schema";


interface ProfileScreenProps {
  profile: UserProfile;
  onUpdate: (data: UpdateProfileRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ profile, onUpdate, onDelete, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.profileUrl);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName || "",
      email: profile.email || "",
      gender: profile.gender || "",
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
      bloodGroup: profile.bloodGroup || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await onUpdate({
        ...values,
        dateOfBirth: values.dateOfBirth ? format(values.dateOfBirth, "yyyy-MM-dd") : undefined,
        profile: selectedFile || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-xl">
            <UserSquare2 className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Profile Settings</h1>
        </div>
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          title="Close"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-hide">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-amber-50 shadow-xl transition-all group-hover:scale-105 duration-300">
              <UserAvatar 
                src={previewUrl} 
                name={profile.fullName} 
                className="w-full h-full rounded-none"
                fallbackClassName="bg-amber-100 text-amber-700 text-3xl font-black"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 bg-amber-500 rounded-2xl shadow-lg border-4 border-white hover:bg-amber-600 transition-all active:scale-90 group/btn"
            >
              <Camera className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          <p className="mt-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">Personal Identity</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 pb-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <Input
                {...form.register("fullName")}
                className="h-12 pl-11 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-amber-500/20 font-bold text-sm placeholder:text-slate-300"
                placeholder="Enter your name"
              />
            </div>
            {form.formState.errors.fullName && (
              <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Email Address
            </Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <Input
                {...form.register("email")}
                className="h-12 pl-11 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-amber-500/20 font-bold text-sm placeholder:text-slate-300"
                placeholder="name@example.com"
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Mobile Number (Read-only) */}
          <div className="space-y-2 opacity-80">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Mobile Number
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Phone className="w-4 h-4 text-slate-300" />
              </div>
              <div className="h-12 pl-11 bg-slate-100 border-none rounded-2xl flex items-center font-bold text-sm text-slate-500">
                {profile.mobileNumber}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender</Label>
              <Select value={form.watch("gender")} onValueChange={(val) => form.setValue("gender", val)}>
                <SelectTrigger className="h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500/20 font-bold text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl font-bold z-[1000]">
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Blood</Label>
              <Select value={form.watch("bloodGroup")} onValueChange={(val) => form.setValue("bloodGroup", val)}>
                <SelectTrigger className="h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500/20 font-bold text-sm">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl font-bold z-[1000]">
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Date of Birth
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-12 bg-slate-50 border-none rounded-2xl justify-start text-left font-bold text-sm hover:bg-slate-100 transition-colors px-4",
                    !form.watch("dateOfBirth") && "text-slate-300",
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-3 text-slate-300" />
                  {form.watch("dateOfBirth") ? (
                    format(form.watch("dateOfBirth")!, "dd-MM-yyyy")
                  ) : (
                    <span>Date of Birth</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl z-[1000]"
                align="center"
                side="top"
                autoFocus
              >
                <Calendar
                  mode="single"
                  selected={form.watch("dateOfBirth")}
                  onSelect={(date) => form.setValue("dateOfBirth", date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="p-4"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Danger Zone */}
        {onDelete && (
          <div className="pt-8 border-t border-slate-100">
            <div className="bg-red-50/50 rounded-3xl p-6 border border-red-50">
              <h3 className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-2 px-1">Danger Zone</h3>
              <p className="text-[11px] font-bold text-slate-400 mb-4 px-1 leading-relaxed">
                Permanently deactivate your account. This action is irreversible after 30 days.
              </p>

              <Popover open={isDeletePopoverOpen} onOpenChange={setIsDeletePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-12 bg-white hover:bg-red-50 text-red-500 font-black text-xs rounded-2xl border border-red-100 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Delete My Account
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-6 rounded-3xl border-none shadow-2xl z-[1100]" align="end" side="top">
                  <div className="space-y-4 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Are you absolutely sure?</h4>
                      <p className="text-[11px] font-bold text-slate-400 mt-1">
                        This will permanently delete your profile and all associated data.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        variant="ghost"
                        className="h-10 rounded-xl font-bold text-xs"
                        onClick={() => setIsDeletePopoverOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="h-10 rounded-xl font-black text-xs bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100"
                        onClick={async () => {
                          setIsDeletePopoverOpen(false);
                          setIsSubmitting(true);
                          try {
                            await onDelete();
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                      >
                        Yes, Delete
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Submit */}
      <div className="px-8 py-6 border-t border-slate-50 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-black text-base rounded-2xl shadow-xl shadow-amber-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving Changes
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </div>
  );
};
