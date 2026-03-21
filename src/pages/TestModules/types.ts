export interface AppLocation {
  text: string;
  lat: number;
  lng: number;
  address?: string;
  /** Place name for search history (e.g. from autocomplete mainText or recent place_name) */
  placeName?: string;
}

export type SimulatorScreen =
  | "START"
  | "HOME"
  | "WALLET"
  | "HISTORY"
  | "PROFILE"
  | "SAVED_LOCATIONS"
  | "SEARCH"
  | "LOCATION_PICKER"
  | "RESULTS"
  | "OPTIONS"
  | "CONFIRMATION"
  | "SEAT_SELECTION"
  | "AUTH_PHONE"
  | "AUTH_OTP"
  | "AUTH_REGISTER"
  | "AUTH_LOGIN";

export interface Log {
  time: string;
  msg: string;
  type: "info" | "success" | "error" | "request" | "response";
}

export const TEST_USER_TOKEN_KEY = "test_user_token";
export const TEST_USER_REFRESH_TOKEN_KEY = "test_user_refresh_token";
