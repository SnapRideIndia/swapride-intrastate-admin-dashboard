/**
 * Centralized API endpoints for the application.
 * All backend URLs should be defined here.
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/admin/login",
    REFRESH: "/admin/refresh",
    LOGOUT: "/admin/logout",
    FORGOT_PASSWORD: "/admin/forgot-password",
    RESET_PASSWORD: "/admin/reset-password",
    ME: "/admin/me",
  },

  // Users
  USERS: {
    BASE: "/admin/users",
    GET_ALL: "/admin/users",
    GET_BY_ID: (id: string) => `/admin/users/${id}`,
    UPDATE: (id: string) => `/admin/users/${id}`, // PATCH
    DELETE: (id: string) => `/admin/users/${id}`,
  },

  // Admins
  ADMINS: {
    BASE: "/admin/manage",
    GET_ALL: "/admin/manage",
    GET_BY_ID: (id: string) => `/admin/manage/${id}`,
    CREATE: "/admin/register",
    UPDATE: (id: string) => `/admin/manage/${id}`,
    DELETE: (id: string) => `/admin/manage/${id}`,
    ACTIVATE: (id: string) => `/admin/${id}/activate`,
    SUSPEND: (id: string) => `/admin/${id}/suspend`,
    STATS: "/admin/stats",
  },

  // Roles
  ROLES: {
    BASE: "/admin/roles",
    GET_ALL: "/admin/roles",
    GET_BY_ID: (id: string) => `/admin/roles/${id}`,
    CREATE: "/admin/roles",
    UPDATE: (id: string) => `/admin/roles/${id}`,
    DELETE: (id: string) => `/admin/roles/${id}`,
    PERMISSIONS: (id: string) => `/admin/roles/${id}/permissions`,
    ADMIN_COUNT: (id: string) => `/admin/roles/${id}/admin-count`,
  },

  // Permissions
  PERMISSIONS: {
    GET_ALL: "/admin/permissions",
  },

  // Routes
  ROUTES: {
    BASE: "/admin/routes",
    GET_ALL: "/admin/routes",
    GET_BY_ID: (id: string) => `/admin/routes/${id}`,
    CREATE: "/admin/routes",
    UPDATE: (id: string) => `/admin/routes/${id}`,
    DELETE: (id: string) => `/admin/routes/${id}`,
    ADD_STOP: (id: string) => `/admin/routes/${id}/stops`,
    REORDER_STOPS: (id: string) => `/admin/routes/${id}/reorder-stops`,
    SYNC_METRICS: (id: string) => `/admin/routes/${id}/sync`,
    STOPS: {
      UPDATE: (stopId: string) => `/admin/routes/stops/${stopId}`,
      DELETE: (stopId: string) => `/admin/routes/stops/${stopId}`,
    },
  },

  // Points
  POINTS: {
    BASE: "/admin/points",
    GET_ALL: "/admin/points",
    GET_BY_ID: (id: string) => `/admin/points/${id}`,
    CREATE: "/admin/points",
    UPDATE: (id: string) => `/admin/points/${id}`,
    DELETE: (id: string) => `/admin/points/${id}`,
    IMAGES: {
      CREATE: (id: string) => `/admin/points/${id}/images`,
      DELETE: (id: string, imageId: string) => `/admin/points/${id}/images/${imageId}`,
      SET_PRIMARY: (id: string, imageId: string) => `/admin/points/${id}/images/${imageId}/primary`,
      REORDER: (id: string) => `/admin/points/${id}/images/reorder`,
    },
  },

  // Fleet
  FLEET: {
    LAYOUTS: {
      BASE: "/admin/fleet/layouts",
      GET_ALL: "/admin/fleet/layouts",
      GET_BY_ID: (id: string) => `/admin/fleet/layouts/${id}`,
      CREATE: "/admin/fleet/layouts",
      UPDATE: (id: string) => `/admin/fleet/layouts/${id}`,
      DELETE: (id: string) => `/admin/fleet/layouts/${id}`,
      DUPLICATE: (id: string) => `/admin/fleet/layouts/${id}/duplicate`,
    },
    BUSES: {
      BASE: "/admin/fleet/buses",
      GET_ALL: "/admin/fleet/buses",
      GET_BY_ID: (id: string) => `/admin/fleet/buses/${id}`,
      CREATE: "/admin/fleet/buses",
      UPDATE: (id: string) => `/admin/fleet/buses/${id}`,
      DELETE: (id: string) => `/admin/fleet/buses/${id}`,
    },
  },

  // Drivers
  DRIVERS: {
    BASE: "/admin/drivers",
    GET_ALL: "/admin/drivers",
    GET_BY_ID: (id: string) => `/admin/drivers/${id}`,
    CREATE: "/admin/drivers",
    UPDATE: (id: string) => `/admin/drivers/${id}`,
    DELETE: (id: string) => `/admin/drivers/${id}`,
  },

  // Trips
  TRIPS: {
    BASE: "/admin/trips",
    GET_ALL: "/admin/trips",
    GET_BY_ID: (id: string) => `/admin/trips/${id}`,
    CREATE: "/admin/trips",
    EDIT: (id: string) => `/admin/trips/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/trips/${id}/status`,
    GET_SEATS: (id: string) => `/admin/trips/${id}/seats`,
    GET_PASSENGERS: (id: string) => `/admin/trips/${id}/passengers`,
    DELETE: (id: string) => `/admin/trips/${id}`,
  },

  // Search
  SEARCH: {
    TRIPS: "/search/trips",
    PLACE_AUTOCOMPLETE: "/search/place-autocomplete",
  },

  // Suggestions
  SUGGESTIONS: {
    BASE: "/admin/suggestions",
    GET_ALL: "/admin/suggestions",
    GET_BY_ID: (id: string) => `/admin/suggestions/${id}`,
    UPDATE: (id: string) => `/admin/suggestions/${id}`,
    DELETE: (id: string) => `/admin/suggestions/${id}`,
  },

  // Coupons
  COUPONS: {
    BASE: "/coupons",
    GET_ALL: "/coupons",
    GET_BY_ID: (id: string) => `/coupons/${id}`,
    CREATE: "/coupons",
    UPDATE: (id: string) => `/coupons/${id}`,
    DELETE: (id: string) => `/coupons/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: "/notifications",
    CREATE: "/notifications",
  },
};
