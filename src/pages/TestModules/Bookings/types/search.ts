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
    distanceText: string;
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
    distanceText: string;
    pointId: string;
  };
  timings: SearchTiming[];
  allStops: SearchStop[];
}

export interface SearchTripsParams {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  tripDate: string;
  userLat: number;
  userLng: number;
  preferredTime?: string;
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
  coupon: any;
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
