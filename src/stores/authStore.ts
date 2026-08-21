import { create } from "zustand";
import { User } from "@/types/user";
import { apiFetch } from "@/lib/apiConfig";

function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setAuthCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function removeAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
  updateTemperatureUnit: (unit: "C" | "F") => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Initializes auth state on app start.
   * Checks local storage and cookies first to prevent 401 network errors
   * when the user is not logged in.
   */
  initialize: async () => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("auth_token") || getAuthCookie();
    if (!storedToken) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    setAuthCookie(storedToken);
    set({ token: storedToken });
    await get().fetchProfile();
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
    const token = data.access_token;
    if (token) {
      localStorage.setItem("auth_token", token);
      setAuthCookie(token);
    }

    const storedUnit =
      typeof window !== "undefined"
        ? (localStorage.getItem("temperature_unit") as "C" | "F" | null)
        : null;
    const temperatureUnit = (data.user?.temperatureUnit || storedUnit || "C") as "C" | "F";
    if (typeof window !== "undefined") {
      localStorage.setItem("temperature_unit", temperatureUnit);
    }

    set({
      token: token || null,
      user: data.user ? { ...data.user, temperatureUnit } : null,
      isAuthenticated: true,
      isLoading: false,
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
    const token = data.access_token;
    if (token) {
      localStorage.setItem("auth_token", token);
      setAuthCookie(token);
    }

    const storedUnit =
      typeof window !== "undefined"
        ? (localStorage.getItem("temperature_unit") as "C" | "F" | null)
        : null;
    const temperatureUnit = (data.user?.temperatureUnit || storedUnit || "C") as "C" | "F";
    if (typeof window !== "undefined") {
      localStorage.setItem("temperature_unit", temperatureUnit);
    }

    set({
      token: token || null,
      user: data.user ? { ...data.user, temperatureUnit } : null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    localStorage.removeItem("auth_token");
    removeAuthCookie();
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchProfile: async () => {
    const token = get().token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") || getAuthCookie() : null);
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
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
        const storedUnit =
          typeof window !== "undefined"
            ? (localStorage.getItem("temperature_unit") as "C" | "F" | null)
            : null;
        const temperatureUnit = (user.temperatureUnit || storedUnit || "C") as "C" | "F";
        if (typeof window !== "undefined") {
          localStorage.setItem("temperature_unit", temperatureUnit);
        }
        set({
          user: {
            ...user,
            temperatureUnit,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem("auth_token");
        removeAuthCookie();
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateTemperatureUnit: async (unit: "C" | "F") => {
    // 1. Immediately store in localStorage so client preference is persisted
    if (typeof window !== "undefined") {
      localStorage.setItem("temperature_unit", unit);
    }

    // 2. Optimistically update user object in Zustand state
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          temperatureUnit: unit,
        },
      });
    }

    const token =
      get().token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("auth_token") || getAuthCookie()
        : null);

    if (!token) return;

    // 3. Persist to backend
    try {
      const response = await apiFetch("/users/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ temperatureUnit: unit }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const current = get().user;
        if (current) {
          set({
            user: {
              ...current,
              ...updatedUser,
              temperatureUnit: unit, // ensure chosen unit stays active
            },
          });
        }
      }
    } catch {
      // Retain the user's explicit preference locally even if backend is temporarily offline
    }
  },
}));

