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
  // token param kept for call-site compatibility — cookie is sent automatically
  fetchFavorites: (token?: string) => Promise<void>;
  addFavorite: (token: string | undefined, city: string) => Promise<void>;
  removeFavorite: (token: string | undefined, id: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async (_token?: string) => {
    set({ isLoading: true, error: null });
    try {
      // auth_token HttpOnly cookie is sent automatically via credentials:"include" in apiFetch
      const response = await apiFetch("/favorites");
      if (response.ok) {
        const favorites = await response.json();
        set({ favorites, isLoading: false });
      } else {
        set({ error: "Failed to load favorites", isLoading: false });
      }
    } catch {
      set({ error: "Failed to load favorites", isLoading: false });
    }
  },

  addFavorite: async (_token: string | undefined, city: string) => {
    try {
      const response = await apiFetch("/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  removeFavorite: async (_token: string | undefined, id: string) => {
    try {
      const response = await apiFetch(`/favorites/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        set({ favorites: get().favorites.filter((f) => f.id !== id), error: null });
      }
    } catch {
      set({ error: "Failed to remove favorite" });
    }
  },
}));
