import { ROUTES } from "@/constants/routes";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Buses from "@/pages/Buses";
import RoutesPage from "@/pages/Routes";
import Trips from "@/pages/Trips";
import Users from "@/pages/Users";
import Drivers from "@/pages/Drivers";
import Points from "@/pages/Points";
import Support from "@/pages/Support";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import LiveTracking from "@/pages/LiveTracking";
import Admins from "@/pages/Admins";
import AdminDetails from "@/pages/AdminDetails";
import Roles from "@/pages/Roles";
import BusLayouts from "@/pages/BusLayouts";
import BusLayoutBuilder from "@/pages/BusLayoutBuilder";
import Coupons from "@/pages/Coupons";
import CreateCoupon from "@/pages/CreateCoupon";
import Referrals from "@/pages/Referrals";
import Notifications from "@/pages/Notifications";
import CreateNotification from "@/pages/CreateNotification";
import NotificationDetails from "@/pages/NotificationDetails";
import SearchEngineTester from "@/pages/TestModules/SearchEngineTester";
import FcmTester from "@/pages/TestModules/FcmTester";
import Suggestions from "@/pages/Suggestions";
import SuggestionDetails from "@/pages/SuggestionDetails";
import UserDetails from "@/pages/UserDetails";
import DriverDetails from "@/pages/DriverDetails";
import PaymentDetails from "@/pages/PaymentDetails";
import WalletDetails from "@/pages/WalletDetails";
import Bookings from "@/pages/Bookings";
import BookingDetails from "@/pages/BookingDetails";

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
}

export const publicRoutes: RouteConfig[] = [{ path: ROUTES.LOGIN, element: <Login /> }];

export const protectedRoutes: RouteConfig[] = [
  { path: ROUTES.DASHBOARD, element: <Dashboard /> },
  { path: ROUTES.BUSES, element: <Buses /> },
  { path: ROUTES.BUS_LAYOUTS, element: <BusLayouts /> },
  { path: ROUTES.BUS_LAYOUT_BUILDER, element: <BusLayoutBuilder /> },
  { path: ROUTES.ROUTES, element: <RoutesPage /> },
  { path: ROUTES.POINTS, element: <Points /> },
  { path: ROUTES.SUGGESTIONS, element: <Suggestions /> },
  { path: ROUTES.SUGGESTION_DETAILS, element: <SuggestionDetails /> },
  { path: ROUTES.TRIPS, element: <Trips /> },
  { path: ROUTES.USERS, element: <Users /> },
  { path: ROUTES.USER_DETAILS, element: <UserDetails /> },
  { path: ROUTES.DRIVERS, element: <Drivers /> },
  { path: ROUTES.DRIVER_DETAILS, element: <DriverDetails /> },
  { path: ROUTES.LIVE_TRACKING, element: <LiveTracking /> },
  { path: ROUTES.SUPPORT, element: <Support /> },
  { path: ROUTES.ANALYTICS, element: <Analytics /> },
  { path: ROUTES.PAYMENT_DETAILS, element: <PaymentDetails /> },
  { path: ROUTES.WALLET_DETAILS, element: <WalletDetails /> },
  { path: ROUTES.SETTINGS, element: <Settings /> },
  { path: ROUTES.COUPONS, element: <Coupons /> },
  { path: ROUTES.COUPON_CREATE, element: <CreateCoupon /> },
  { path: ROUTES.COUPON_EDIT, element: <CreateCoupon /> },
  { path: ROUTES.REFERRALS, element: <Referrals /> },
  { path: ROUTES.NOTIFICATIONS, element: <Notifications /> },
  { path: ROUTES.NOTIFICATION_CREATE, element: <CreateNotification /> },
  { path: ROUTES.NOTIFICATION_DETAILS, element: <NotificationDetails /> },
  { path: ROUTES.ADMINS, element: <Admins /> },
  { path: ROUTES.ADMIN_DETAILS, element: <AdminDetails /> },
  { path: ROUTES.ROLES, element: <Roles /> },
  { path: ROUTES.SEARCH_ENGINE_TESTER, element: <SearchEngineTester /> },
  { path: ROUTES.FCM_TEST, element: <FcmTester /> },
  { path: ROUTES.BOOKINGS, element: <Bookings /> },
  { path: ROUTES.BOOKING_DETAILS, element: <BookingDetails /> },
];
