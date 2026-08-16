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
  fetchFavorites: (token: string) => Promise<void>;
  addFavorite: (token: string, city: string) => Promise<void>;
  removeFavorite: (token: string, id: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiFetch("/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const favorites = await response.json();
        set({ favorites, isLoading: false });
      }
    } catch {
      set({ error: "Failed to load favorites", isLoading: false });
    }
  },

  addFavorite: async (token: string, city: string) => {
    try {
      const response = await apiFetch("/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ city }),
      });
      if (response.ok) {
        const favorite = await response.json();
        set({ favorites: [...get().favorites, favorite], error: null });
      }
    } catch {
      set({ error: "Failed to add favorite" });
    }
  },

  removeFavorite: async (token: string, id: string) => {
    try {
      const response = await apiFetch(`/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        set({ favorites: get().favorites.filter((f) => f.id !== id), error: null });
      }
    } catch {
      set({ error: "Failed to remove favorite" });
    }
  },
}));
