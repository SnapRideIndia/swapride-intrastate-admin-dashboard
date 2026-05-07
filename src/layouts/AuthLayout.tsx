import React from "react";
import { Bus } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-600 to-primary-700 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Bus className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">SwapRide Admin</h1>
            <p className="text-primary-100 text-sm">Fleet Management System</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Manage Your
            <br />
            Shuttle Fleet
            <br />
            Efficiently
          </h2>
          <p className="text-primary-100 text-lg max-w-md">
            Complete control over your buses, routes, drivers, and passengers. Real-time tracking and analytics at your
            fingertips.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-primary-100 text-sm">Active Buses</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">100+</p>
              <p className="text-primary-100 text-sm">Daily Trips</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">5000+</p>
              <p className="text-primary-100 text-sm">Happy Passengers</p>
            </div>
          </div>
        </div>

        <p className="text-primary-200 text-sm">© 2024 SwapRide Admin. All rights reserved.</p>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Bus className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SwapRide Admin</h1>
              <p className="text-muted-foreground text-sm">Fleet Management System</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
