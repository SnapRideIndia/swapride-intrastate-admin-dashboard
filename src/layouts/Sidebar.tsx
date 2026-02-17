import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bus,
  Route,
  Users,
  Headphones,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  UserCog,
  MapPin,
  Shield,
  Key,
  LayoutGrid,
  Wallet,
  DollarSign,
  Truck,
  Ticket,
  UserPlus,
  Bell,
  Search,
  Microscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/SidebarContext";
import { usePermissions } from "@/hooks/usePermissions";
import { NavCategory } from "./NavCategory";
import { ROUTES } from "@/constants/routes";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  permission: string | null;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, permission: null },
  { name: "Drivers", href: ROUTES.DRIVERS, icon: UserCog, permission: "DRIVER_VIEW" },
  { name: "Trips", href: ROUTES.TRIPS, icon: ClipboardList, permission: "TRIP_VIEW" },
  { name: "Users", href: ROUTES.USERS, icon: Users, permission: "USER_VIEW" },
  { name: "Live Tracking", href: ROUTES.LIVE_TRACKING, icon: MapPin, permission: "TRACKING_VIEW" },
  { name: "Support", href: ROUTES.SUPPORT, icon: Headphones, permission: "SUPPORT_TICKET_VIEW" },
];

// Collapsible Categories
const busManagementCategory = {
  label: "Bus Management",
  icon: Truck,
  items: [
    { name: "Buses", href: ROUTES.BUSES, icon: Bus, permission: "BUS_VIEW" },
    { name: "Bus Layouts", href: ROUTES.BUS_LAYOUTS, icon: LayoutGrid, permission: "BUS_LAYOUT_VIEW" },
  ],
};

const routesPointsCategory = {
  label: "Routes & Points",
  icon: Route,
  items: [
    { name: "Routes", href: ROUTES.ROUTES, icon: Route, permission: "ROUTE_VIEW" },
    { name: "Points", href: ROUTES.POINTS, icon: MapPin, permission: "POINT_VIEW" },
    { name: "Suggestions", href: ROUTES.SUGGESTIONS, icon: ClipboardList, permission: "VIEW_SUGGESTIONS" },
  ],
};

const financeInsightsCategory = {
  label: "Finance & Insights",
  icon: DollarSign,
  items: [
    { name: "Payments", href: ROUTES.PAYMENTS, icon: Wallet, permission: "PAYMENT_VIEW" },
    { name: "Analytics", href: ROUTES.ANALYTICS, icon: BarChart3, permission: "ANALYTICS_VIEW" },
    { name: "Coupons", href: ROUTES.COUPONS, icon: Ticket, permission: "COUPON_VIEW" },
    { name: "Referrals", href: ROUTES.REFERRALS, icon: UserPlus, permission: "REFERRAL_VIEW" },
    { name: "Notifications", href: ROUTES.NOTIFICATIONS, icon: Bell, permission: "NOTIFICATION_VIEW" },
  ],
};

const testModulesCategory = {
  label: "Test Modules",
  icon: Microscope,
  items: [
    { name: "Search Engine", href: ROUTES.SEARCH_ENGINE_TESTER, icon: Search, permission: null },
    { name: "FCM Test", href: ROUTES.FCM_TEST, icon: Bell, permission: null },
  ],
};

const adminCategory = {
  label: "Administration",
  icon: Shield,
  items: [
    { name: "Admins", href: ROUTES.ADMINS, icon: Shield, permission: "ADMIN_VIEW" },
    { name: "Roles", href: ROUTES.ROLES, icon: Key, permission: "ROLE_VIEW" },
  ],
};

const secondaryNavigation: NavItem[] = [
  { name: "Settings", href: ROUTES.SETTINGS, icon: Settings, permission: "SYSTEM_SETTINGS_VIEW" },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const [openCategory, setOpenCategory] = useState<string | null>("busManagement");

  // Automatically open the category that contains the active route
  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith(ROUTES.BUSES) || path.startsWith(ROUTES.BUS_LAYOUTS)) {
      setOpenCategory("busManagement");
    } else if (path.startsWith(ROUTES.ROUTES) || path.startsWith(ROUTES.POINTS)) {
      setOpenCategory("routesPoints");
    } else if (
      path.startsWith(ROUTES.PAYMENTS) ||
      path.startsWith(ROUTES.ANALYTICS) ||
      path.startsWith(ROUTES.COUPONS) ||
      path.startsWith(ROUTES.REFERRALS) ||
      path.startsWith(ROUTES.NOTIFICATIONS)
    ) {
      setOpenCategory("financeInsights");
    } else if (path.startsWith(ROUTES.ADMINS) || path.startsWith(ROUTES.ROLES)) {
      setOpenCategory("administration");
    } else if (path.startsWith("/test")) {
      setOpenCategory("testModules");
    }
  }, [location.pathname]);

  const handleCategoryToggle = (categoryId: string) => {
    setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const filterByPermission = (items: typeof navigation) => {
    return items.filter((item) => !item.permission || hasPermission(item.permission));
  };

  const filteredNavigation = filterByPermission(navigation);
  const filteredSecondaryNavigation = filterByPermission(secondaryNavigation);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Bus className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">ShuttleAdmin</span>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto">
            <Bus className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive =
              location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "nav-item",
                  isActive ? "nav-item-active" : "nav-item-inactive",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mr-0")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Bus Management Category */}
        <div className="py-2 border-t border-sidebar-border">
          <NavCategory
            id="busManagement"
            label={busManagementCategory.label}
            icon={busManagementCategory.icon}
            items={busManagementCategory.items}
            isExpanded={openCategory === "busManagement"}
            onToggle={handleCategoryToggle}
            collapsed={collapsed}
            hasPermission={hasPermission}
          />
        </div>

        {/* Routes & Points Category */}
        <div className="py-2 border-t border-sidebar-border">
          <NavCategory
            id="routesPoints"
            label={routesPointsCategory.label}
            icon={routesPointsCategory.icon}
            items={routesPointsCategory.items}
            isExpanded={openCategory === "routesPoints"}
            onToggle={handleCategoryToggle}
            collapsed={collapsed}
            hasPermission={hasPermission}
          />
        </div>

        {/* Finance & Insights Category */}
        <div className="py-2 border-t border-sidebar-border">
          <NavCategory
            id="financeInsights"
            label={financeInsightsCategory.label}
            icon={financeInsightsCategory.icon}
            items={financeInsightsCategory.items}
            isExpanded={openCategory === "financeInsights"}
            onToggle={handleCategoryToggle}
            collapsed={collapsed}
            hasPermission={hasPermission}
          />
        </div>

        {/* Administration Category */}
        <div className="py-2 border-t border-sidebar-border">
          <NavCategory
            id="administration"
            label={adminCategory.label}
            icon={adminCategory.icon}
            items={adminCategory.items}
            isExpanded={openCategory === "administration"}
            onToggle={handleCategoryToggle}
            collapsed={collapsed}
            hasPermission={hasPermission}
          />
        </div>

        {/* Test Modules Category */}
        <div className="py-2 border-t border-sidebar-border">
          <NavCategory
            id="testModules"
            label={testModulesCategory.label}
            icon={testModulesCategory.icon}
            items={testModulesCategory.items}
            isExpanded={openCategory === "testModules"}
            onToggle={handleCategoryToggle}
            collapsed={collapsed}
            hasPermission={hasPermission}
          />
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        {filteredSecondaryNavigation.map((item) => {
          const isActive =
            location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "nav-item",
                isActive ? "nav-item-active" : "nav-item-inactive",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mr-0")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Collapse Button */}
        <button
          onClick={toggle}
          className={cn("nav-item nav-item-inactive w-full mt-2", collapsed && "justify-center px-2")}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
