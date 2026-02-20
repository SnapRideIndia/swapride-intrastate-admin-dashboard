export const ROUTES = {
  // Public
  LOGIN: "/login",
  NO_NETWORK: "/no-network",
  BACKEND_OFFLINE: "/backend-offline",

  // Core
  DASHBOARD: "/",
  BUSES: "/buses",
  BUS_LAYOUTS: "/bus-layouts",
  BUS_LAYOUT_BUILDER: "/bus-layouts/:id",
  ROUTES: "/routes",
  POINTS: "/points",
  SUGGESTIONS: "/suggestions",
  SUGGESTION_DETAILS: "/routes/suggestions/:id",
  STOPS: "/stops",
  TRIPS: "/trips",
  USERS: "/users",
  USER_DETAILS: "/users/:id",
  DRIVERS: "/drivers",
  DRIVER_DETAILS: "/drivers/:id",
  LIVE_TRACKING: "/live-tracking",
  SUPPORT: "/support",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",

  // Finance & Insights
  PAYMENTS: "/payments",
  PAYMENT_DETAILS: "/payments/:id",
  WALLET_DETAILS: "/payments/wallet-management/wallet/:id",
  COUPONS: "/coupons",
  COUPON_CREATE: "/coupons/create",
  COUPON_EDIT: "/coupons/edit/:id",
  REFERRALS: "/referrals",
  NOTIFICATIONS: "/notifications",
  BOOKINGS: "/bookings",
  BOOKING_DETAILS: "/bookings/:id",
  NOTIFICATION_CREATE: "/notifications/create",
  NOTIFICATION_DETAILS: "/notifications/:id",

  // Payment Sub-routes
  PAYMENT_OVERVIEW: "/payments/payment-overview",
  TRANSACTIONS: "/payments/transactions",
  WALLET_MANAGEMENT: "/payments/wallet-management",
  PAYMENT_ANALYTICS: "/payments/analytics",
  UNIVERSAL_TRACKER: "/payments/tracker",

  // Admin Management
  ADMINS: "/admins",
  ADMIN_DETAILS: "/admins/:id",
  ROLES: "/roles",

  // Test Modules
  SEARCH_ENGINE_TESTER: "/test/search-engine",
  FCM_TEST: "/test/fcm",
} as const;
