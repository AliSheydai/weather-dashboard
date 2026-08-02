import { create } from "zustand";

interface Favorite {
  id: string;
  city: string;
  createdAt: string;
}

interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  fetchFavorites: (token: string) => Promise<void>;
  addFavorite: (token: string, city: string) => Promise<void>;
  removeFavorite: (token: string, id: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,

  fetchFavorites: async (token: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const favorites = await response.json();
        set({ favorites, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addFavorite: async (token: string, city: string) => {
    try {
      const response = await fetch(`${API_URL}/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ city }),
      });
      if (response.ok) {
        const favorite = await response.json();
        set({ favorites: [...get().favorites, favorite] });
      }
    } catch {
      // Handle error
    }
  },

  removeFavorite: async (token: string, id: string) => {
    try {
      const response = await fetch(`${API_URL}/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        set({ favorites: get().favorites.filter((f) => f.id !== id) });
      }
    } catch {
      // Handle error
    }
  },
}));
