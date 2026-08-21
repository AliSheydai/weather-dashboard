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
  fetchHistory: (token?: string) => Promise<void>;
  clearHistory: (token?: string) => Promise<void>;
}

function getAuthHeader(token?: string): Record<string, string> {
  const effectiveToken =
    token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null);
  return effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {};
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  isLoading: false,
  error: null,

  fetchHistory: async (token?: string) => {
    set({ isLoading: true, error: null });
    try {
      const headers = getAuthHeader(token);
      const response = await apiFetch("/history", { headers });
      if (response.ok) {
        const history = await response.json();
        set({ history: Array.isArray(history) ? history : [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ error: "Failed to load search history", isLoading: false });
    }
  },

  clearHistory: async (token?: string) => {
    try {
      const headers = getAuthHeader(token);
      const response = await apiFetch("/history", {
        method: "DELETE",
        headers,
      });
      if (response.ok) {
        set({ history: [], error: null });
      }
    } catch {
      set({ error: "Failed to clear history" });
    }
  },
}));
