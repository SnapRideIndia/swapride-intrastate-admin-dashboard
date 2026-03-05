export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string | null;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  profileUrl: string | null;
  isOnboarded: boolean;
  walletBalance: number;
  homeLocation?: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  };
  workLocation?: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  profile?: File; // For multipart/form-data
}
