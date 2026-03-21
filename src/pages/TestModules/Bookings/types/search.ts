export interface SearchTiming {
  tripId: string;
  pickupArrivalTime: string;
  dropoffArrivalTime: string;
  busNumber: string;
  availableSeats: number;
}

export interface SearchStop {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  images: Array<{
    id: string;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
  }>;
  arrivalTime: string;
  sequence: number;
  pointId: string;
  isUserSegment: boolean;
}

export interface SearchResult {
  routeId: string;
  routeName: string;
  baseFare: number;
  pickup: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    images: Array<{
      id: string;
      imageUrl: string;
      displayOrder: number;
      isPrimary: boolean;
    }>;
    distance: string;
    travelTime: string;
    travelType: "WALK" | "DRIVE";
    pointId: string;
  };
  dropoff: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    images: Array<{
      id: string;
      imageUrl: string;
      displayOrder: number;
      isPrimary: boolean;
    }>;
    distance: string;
    travelTime: string;
    travelType: "WALK" | "DRIVE";
    pointId: string;
  };
  timings: SearchTiming[];
  allStops: SearchStop[];
  originalPrice: number;
  discountedPrice: number;
  appliedCoupon?: {
    id: string;
    code: string;
    discountAmount: number;
    isAutoApply?: boolean;
  };
  nearestPoint: {
    name: string;
    distance: string;
    travelTime: string;
    travelType: "WALK" | "DRIVE";
    proximityMessage: string;
  };
}

export interface SearchTripsParams {
  pickup?: {
    latitude: number;
    longitude: number;
    address: string;
    placeName?: string;
  };
  dropoff?: {
    latitude: number;
    longitude: number;
    address: string;
    placeName?: string;
  };
  userLocation: {
    latitude: number;
    longitude: number;
  };
  tripDate: string;
  officeTimings?: string;
  preferredTime?: string;
  pickupPointId?: string;
  dropoffPointId?: string;
}

export interface InitiateBookingDto {
  tripId: string;
  pickupStopId: string;
  dropoffStopId: string;
  totalAmount: number;
  seatNumbers?: string[];
}

export interface InitiateRoundTripDto {
  outbound: InitiateBookingDto;
  returnTrip: InitiateBookingDto;
}

export interface BookingResponse {
  bookingId: string;
  expiresAt: string;
  totalAmount: number;
  subTotal: number;
  discountAmount: number;
  assignedSeats: Array<{ seatId: string; seatNumber: string }>;
  coupon: {
    id: string;
    code: string;
    discountAmount: number;
    isAutoApply?: boolean;
  } | null;
  message: string;
}

export interface RoundTripBookingResponse {
  outboundBookingId: string;
  returnBookingId: string;
  totalPayable: number;
  expiresAt: string;
  outbound: BookingResponse;
  return: BookingResponse;
  message: string;
}
export interface LegDetail {
  bookingId: string;
  tripId: string;
  bookingStatus: string;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  coupon: {
    id: string;
    code: string;
    discountAmount: number;
    isAutoApply?: boolean;
  } | null;
  expiresAt: string;
  assignedSeats: Array<{ seatId: string; seatNumber: string }>;
  pickup: {
    name: string;
    address: string;
    arrivalTime: string;
    distance: string | null;
    travelTime: string | null;
    travelType: "WALK" | "DRIVE" | null;
  };
  dropoff: {
    name: string;
    address: string;
    arrivalTime: string;
  };
}

export interface SingleBookingDetails extends LegDetail {
  isRoundTrip: false;
  totalPayable: number;
}

export interface RoundBookingDetails {
  isRoundTrip: true;
  totalPayable: number;
  expiresAt: string;
  outbound: LegDetail;
  return: LegDetail;
}

export type BookingDetails = SingleBookingDetails | RoundBookingDetails;
