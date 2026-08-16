import { create } from "zustand";
import { apiFetch } from "@/lib/apiConfig";

interface HistoryItem {
  id: string;
  city: string;
  searchedAt: string;
}

interface HistoryState {
  history: HistoryItem[];
  isLoading: boolean;
  error: string | null;
  // token params kept for call-site compatibility — cookie is sent automatically
  fetchHistory: (token?: string) => Promise<void>;
  clearHistory: (token?: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  isLoading: false,
  error: null,

  fetchHistory: async (_token?: string) => {
    set({ isLoading: true, error: null });
    try {
      // auth_token HttpOnly cookie is sent automatically via credentials:"include"
      const response = await apiFetch("/history");
      if (response.ok) {
        const history = await response.json();
        set({ history, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ error: "Failed to load search history", isLoading: false });
    }
  },

  clearHistory: async (_token?: string) => {
    try {
      const response = await apiFetch("/history", {
        method: "DELETE",
      });
      if (response.ok) {
        set({ history: [], error: null });
      }
    } catch {
      set({ error: "Failed to clear history" });
    }
  },
}));
