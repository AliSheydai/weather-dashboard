import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WEATHER_ALERT" | "SYSTEM" | "WARNING";
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  lastFetchTime: number;
  fetchNotifications: (token: string) => Promise<void>;
  fetchUnreadCount: (token: string) => Promise<void>;
  markAsRead: (token: string, id: string) => Promise<void>;
  markAllAsRead: (token: string) => Promise<void>;
  deleteNotification: (token: string, id: string) => Promise<void>;
  reset: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const CACHE_DURATION = 60 * 1000; // 60 seconds

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  hasFetched: false,
  lastFetchTime: 0,

  fetchNotifications: async (token: string) => {
    const { lastFetchTime, hasFetched } = get();
    const now = Date.now();

    // Skip if fetched recently (cache)
    if (hasFetched && now - lastFetchTime < CACHE_DURATION) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const items = await response.json();
      const unreadCount = items.filter((n: Notification) => !n.isRead).length;

      set({
        items,
        unreadCount,
        isLoading: false,
        hasFetched: true,
        lastFetchTime: now,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load notifications",
        isLoading: false,
      });
    }
  },

  fetchUnreadCount: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const { count } = await response.json();
      set({ unreadCount: count });
    } catch {
      // Silently fail for background polling
    }
  },

  markAsRead: async (token: string, id: string) => {
    // Optimistic update
    const prevItems = get().items;
    const prevCount = get().unreadCount;

    set({
      items: prevItems.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, prevCount - (prevItems.find((n) => n.id === id && !n.isRead) ? 1 : 0)),
    });

    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        // Revert on failure
        set({ items: prevItems, unreadCount: prevCount });
      }
    } catch {
      set({ items: prevItems, unreadCount: prevCount });
    }
  },

  markAllAsRead: async (token: string) => {
    // Optimistic update
    const prevItems = get().items;
    const prevCount = get().unreadCount;

    set({
      items: prevItems.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    });

    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        set({ items: prevItems, unreadCount: prevCount });
      }
    } catch {
      set({ items: prevItems, unreadCount: prevCount });
    }
  },

  deleteNotification: async (token: string, id: string) => {
    const prevItems = get().items;
    const deletedItem = prevItems.find((n) => n.id === id);

    set({
      items: prevItems.filter((n) => n.id !== id),
      unreadCount: Math.max(0, get().unreadCount - (deletedItem && !deletedItem.isRead ? 1 : 0)),
    });

    try {
      const response = await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        set({ items: prevItems });
      }
    } catch {
      set({ items: prevItems });
    }
  },

  reset: () => {
    set({
      items: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      hasFetched: false,
      lastFetchTime: 0,
    });
  },
}));
