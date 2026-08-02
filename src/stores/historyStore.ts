import { create } from "zustand";

interface HistoryItem {
  id: string;
  city: string;
  searchedAt: string;
}

interface HistoryState {
  history: HistoryItem[];
  isLoading: boolean;
  fetchHistory: (token: string) => Promise<void>;
  clearHistory: (token: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  isLoading: false,

  fetchHistory: async (token: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const history = await response.json();
        set({ history, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  clearHistory: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        set({ history: [] });
      }
    } catch {
      // Handle error
    }
  },
}));
