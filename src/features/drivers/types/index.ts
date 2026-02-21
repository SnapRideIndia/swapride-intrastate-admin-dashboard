import { Driver } from "@/types";

export interface BusDetails {
  registrationNumber: string;
  make: string;
  model: string;
  capacity: number;
  yearOfManufacture: number;
}

export interface DriverRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: string;
  busDetails: BusDetails;
  documents: string[];
  status: "Pending" | "Approved" | "Rejected";
  appliedDate: string;
  notes?: string;
}
