// Storage Service - Handles all localStorage operations

const STORAGE_KEYS = {
  BUSES: "shuttle_buses",
  ROUTES: "shuttle_routes",
  DRIVERS: "shuttle_drivers",
  USERS: "shuttle_users",
  TRIPS: "shuttle_trips",
  BOOKINGS: "shuttle_bookings",
  NOTIFICATIONS: "shuttle_notifications",
  AUTH: "shuttle_auth",
  ADMINS: "shuttle_admins",
  ROLES: "shuttle_roles",
  ROLE_PERMISSIONS: "shuttle_role_permissions",
  ADMIN_PASSWORDS: "shuttle_admin_passwords",
  SIDEBAR_STATE: "shuttle_sidebar_collapsed",
} as const;

export const storageService = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {}
  },

  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};

export { STORAGE_KEYS };
