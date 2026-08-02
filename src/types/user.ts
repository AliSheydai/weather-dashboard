export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  defaultCity: string;
  temperatureUnit: "C" | "F";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
