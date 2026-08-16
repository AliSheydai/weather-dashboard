import { create } from "zustand";
import { User } from "@/types/user";
import { apiFetch } from "@/lib/apiConfig";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      set({ token: storedToken });
      await get().fetchProfile();
    }
    set({ isLoading: false });
  },

  login: async (email: string, password: string) => {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Invalid email or password");
    }

    const data = await response.json();
    localStorage.setItem("auth_token", data.access_token);
    set({
      token: data.access_token,
      user: data.user,
      isAuthenticated: true,
    });
  },

  register: async (email: string, password: string, name?: string) => {
    const response = await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Registration failed");
    }

    const data = await response.json();
    localStorage.setItem("auth_token", data.access_token);
    set({
      token: data.access_token,
      user: data.user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await apiFetch("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem("auth_token");
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
