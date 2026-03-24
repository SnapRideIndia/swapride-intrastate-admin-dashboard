export type RentalStatus = "PENDING" | "CALLED" | "QUOTED" | "CONFIRMED" | "CANCELLED";

export type PassengerRange = "1-4" | "1-6" | "7-17" | "18-25" | "26-35" | "35+";

export interface RentalUser {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  profileUrl?: string | null;
}

export interface RentalRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: RentalUser;
  originAddress: string;
  originLat: number;
  originLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  departureDate: string;
  arrivalDate: string;
  passengerRange: PassengerRange;
  status: RentalStatus;
  notes: string | null;
}

export interface RentalsResponse {
  data: RentalRequest[];
  total: number;
  limit: number;
  offset: number;
}
