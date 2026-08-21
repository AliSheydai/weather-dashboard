import { create } from "zustand";
import { apiFetch } from "@/lib/apiConfig";

interface Favorite {
  id: string;
  city: string;
  createdAt: string;
}

interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: (token?: string) => Promise<void>;
  addFavorite: (token: string | undefined, city: string) => Promise<void>;
  removeFavorite: (token: string | undefined, id: string) => Promise<void>;
}

function getAuthHeader(token?: string): Record<string, string> {
  const effectiveToken =
    token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null);
  return effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {};
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async (token?: string) => {
    set({ isLoading: true, error: null });
    try {
      const headers = getAuthHeader(token);
      const response = await apiFetch("/favorites", { headers });
      if (response.ok) {
        const favorites = await response.json();
        set({ favorites: Array.isArray(favorites) ? favorites : [], isLoading: false });
      } else {
        set({ error: "Failed to load favorites", isLoading: false });
      }
    } catch {
      set({ error: "Failed to load favorites", isLoading: false });
    }
  },

  addFavorite: async (token: string | undefined, city: string) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeader(token),
      };
      const response = await apiFetch("/favorites", {
        method: "POST",
        headers,
        body: JSON.stringify({ city }),
      });
      if (response.ok) {
        const favorite = await response.json();
        set({ favorites: [...get().favorites, favorite], error: null });
      } else {
        const errData = await response.json().catch(() => ({}));
        const message = errData.message || "Failed to add favorite";
        const formattedMsg = Array.isArray(message) ? message.join(", ") : message;
        set({ error: formattedMsg });
        throw new Error(formattedMsg);
      }
    } catch (error: any) {
      set({ error: error?.message || "Failed to add favorite" });
      throw error;
    }
  },

  removeFavorite: async (token: string | undefined, id: string) => {
    try {
      const headers = getAuthHeader(token);
      const response = await apiFetch(`/favorites/${id}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) {
        set({ favorites: get().favorites.filter((f) => f.id !== id), error: null });
      } else {
        const errData = await response.json().catch(() => ({}));
        const message = errData.message || "Failed to remove favorite";
        const formattedMsg = Array.isArray(message) ? message.join(", ") : message;
        set({ error: formattedMsg });
        throw new Error(formattedMsg);
      }
    } catch (error: any) {
      set({ error: error?.message || "Failed to remove favorite" });
      throw error;
    }
  },
}));
