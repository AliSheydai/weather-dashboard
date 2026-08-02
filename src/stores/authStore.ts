import { create } from "zustand";
import { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    set({
      token: data.access_token,
      isAuthenticated: true,
    });

    // Fetch user profile after login
    const profileResponse = await fetch(`${API_URL}/users/me`);
    if (profileResponse.ok) {
      const user = await profileResponse.json();
      set({ user });
    }
  },

  register: async (email: string, password: string, name?: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    // Auto-login after registration
    const data = await response.json();
    set({
      user: {
        id: data.id,
        email: data.email,
        name: data.name || null,
        avatar: null,
        defaultCity: "New York",
        temperatureUnit: "C",
      },
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  fetchProfile: async () => {
    const response = await fetch(`${API_URL}/users/me`);
    if (response.ok) {
      const user = await response.json();
      set({ user, isAuthenticated: true });
    }
  },
}));
