import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { storageService, STORAGE_KEYS } from "@/utils/storage";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return storageService.get<boolean>(STORAGE_KEYS.SIDEBAR_STATE) ?? false;
  });

  useEffect(() => {
    storageService.set(STORAGE_KEYS.SIDEBAR_STATE, collapsed);
  }, [collapsed]);

  const toggle = () => setCollapsed(!collapsed);

  return <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
