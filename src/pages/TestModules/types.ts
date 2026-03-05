export interface AppLocation {
  text: string;
  lat: number;
  lng: number;
  address?: string;
}

export type SimulatorScreen =
  | "START"
  | "HOME"
  | "WALLET"
  | "HISTORY"
  | "PROFILE"
  | "SEARCH"
  | "LOCATION_PICKER"
  | "RESULTS"
  | "OPTIONS"
  | "CONFIRMATION"
  | "SEAT_SELECTION";

export interface Log {
  time: string;
  msg: string;
  type: "info" | "success" | "error" | "request" | "response";
}

export const TEST_USER_TOKEN_KEY = "test_user_token";
export const TEST_USER_REFRESH_TOKEN_KEY = "test_user_refresh_token";
