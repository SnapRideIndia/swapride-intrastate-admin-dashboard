// Core Types for Shuttle Admin Dashboard

export interface Bus {
  id: string;
  busNumber: string;
  model: string | null;
  registrationNumber: string | null;
  seatCapacity: number | null;
  fuelType: string | null;
  manufactureYear: number | null;
  insuranceExpiry: string | null; // ISO Date string
  fitnessExpiry: string | null; // ISO Date string
  make: string | null;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  layoutId: string | null;
  layout: BusLayout | null;
  currentRoute: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  routeId: string;
  routeName: string;
  from?: string;
  to?: string;
  description?: string;
  totalDistance: number;
  totalDuration: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  stopsCount?: number;
  busesCount?: number;
  baseFare: number;
  stops: Stop[];
  assignedBuses?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Stop {
  id: string;
  routeId: string;
  pointId: string;
  name?: string; // Loaded from point
  address?: string; // Loaded from point
  point?: {
    name: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    images?: PointImage[];
  };
  sequenceOrder: number;
  distanceToNext?: number | null;
  durationToNext?: number | null;
  stopType: "Pickup" | "Drop" | "Both";
  landmark?: string;
  contactPerson?: string;
}

export interface PointImage {
  id: string;
  pointId: string;
  imageUrl: string;
  displayOrder: number;
  caption?: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Point {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  latitude: number;
  longitude: number;
  images: PointImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  mobileNumber: string;
  licenseNumber: string;
  licenseAttachmentId: string | null;
  licenseAttachment?: {
    id: string;
    url: string;
    type: string;
  };
  rating: number;
  status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "ON_LEAVE" | "BLOCKED";
  profileUrl: string | null;
  lastLogin: string | null;
  totalTrips: number;
  trips?: Trip[];
  assignedBus?: {
    id: string;
    busNumber: string;
    model: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  bloodGroup?: string;
  address?: string;
  dob?: string;
  profileUrl?: string; // Added missing property
  totalBookings: number;
  totalAmountSpent: number;
  lastBookingDate?: string;
  registrationDate: string;
  status: "ACTIVE" | "BLOCKED" | "SUSPENDED" | string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: "CREDIT" | "DEBIT" | "REFUND" | "TOPUP"; // Expanded types
  status: "SUCCESS" | "PENDING" | "FAILED";
  description: string;
  balanceAfter: number;
  referenceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  user: User;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string; // Added missing property
  updatedAt: string;
  stats?: {
    totalCredit: number;
    totalDebit: number;
  };
}

export interface Trip {
  id: string;
  date: string;
  routeId: string;
  routeName: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  tripStatus: "On Time" | "Delayed" | "Early";
  delayMinutes: number;
  delayReason?: string;
  totalPassengers: number;
  revenue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userContact: string;
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  seatNumber: string;
  pickupStop: string;
  dropStop: string;
  bookingDate: string;
  travelDate: string;
  amount: number;
  paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded";
  paymentId?: string;
  boardingStatus: "Boarded" | "Not Boarded" | "No Show";
  bookingTime: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "booking" | "payment" | "delay" | "maintenance" | "trip" | "system" | "alert" | string;
  title: string;
  content: string;
  targetGroup?: string;
  relatedId?: string;
  relatedType?: string;
  read: boolean;
  createdAt: string;
}

// Extended Admin User with RBAC
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  roleId: string;
  roleName: string;
  roleSlug: string;
  permissions: string[];
  status: "Active" | "Inactive" | "Suspended";
  profilePicture?: string;
  department?: string;
  notes?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Role definition
export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

// Permission definition
export interface Permission {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  isSystemPermission: boolean;
}

// Role-Permission mapping
export interface RolePermission {
  roleId: string;
  permissionId: string;
}

export interface AnalyticsFilters {
  dateRange: "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth" | "custom";
  startDate?: string;
  endDate?: string;
  routeId?: string;
  busId?: string;
}

export interface DashboardStats {
  totalBuses: number;
  activeBuses: number;
  totalDrivers: number;
  availableDrivers: number;
  totalUsers: number;
  activeTripsToday: number;
  todayRevenue: number;
  todayBookings: number;
  busesOnTime: number;
  busesDelayed: number;
}

// Bus Layout Types
export type SeatType = "SEATER" | "EMPTY";
export type LayoutType = "2x2" | "2x3" | "3x2" | "custom";
export type LayoutStatus = "active" | "inactive" | "archived";
export type NumberingDirection = "LTR" | "RTL";

export interface LayoutSeat {
  id: string;
  seatNumber: string | null;
  rowPosition: number;
  colPosition: number;
  seatType: SeatType | null;
  isActive: boolean;
}

export interface BusLayout {
  id: string;
  name: string;
  totalRows: number;
  totalColumns: number;
  description: string;
  layoutType: LayoutType;
  totalSeats: number;
  status: LayoutStatus;
  numberingDirection: NumberingDirection;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  busesUsing: number;
  seats: LayoutSeat[];
}

// Stop Suggestion Types
export type SuggestionStatus = "PENDING" | "REVIEWED" | "IMPLEMENTED" | "REJECTED";
export type SuggestionShift = "MORNING" | "EVENING";

export interface StopSuggestion {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    profileUrl?: string;
  };
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  shift: SuggestionShift;
  reachingTime: string;
  description?: string;
  status: SuggestionStatus;
  adminNotes?: string;
  reviewedById?: string;
  reviewedBy?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
