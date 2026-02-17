import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useSidebar } from "@/providers/SidebarContext";
import { cn } from "@/lib/utils";
import { useFcm } from "@/hooks/useFcm";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { collapsed } = useSidebar();
  useFcm(); // Initialize FCM

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn("transition-all duration-300", collapsed ? "pl-16" : "pl-60")}>
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
