"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Cloud,
  AlertTriangle,
  Info,
  Settings,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useNotificationStore,
  Notification,
} from "@/stores/notificationStore";

interface NotificationBellProps {
  token: string | null;
  isAuthenticated: boolean;
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getTypeIcon(type: Notification["type"]) {
  switch (type) {
    case "WEATHER_ALERT":
      return <Cloud className="h-3.5 w-3.5 text-blue-400" />;
    case "WARNING":
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    case "SYSTEM":
      return <Settings className="h-3.5 w-3.5 text-purple-400" />;
    case "INFO":
    default:
      return <Info className="h-3.5 w-3.5 text-indigo-400" />;
  }
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`group relative flex gap-3 px-4 py-3 transition-colors cursor-pointer ${
        notification.isRead
          ? "opacity-60 hover:opacity-80"
          : "hover:bg-white/[0.04]"
      }`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}

      {/* Type icon */}
      <div className="shrink-0 mt-0.5">{getTypeIcon(notification.type)}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-white truncate">
          {notification.title}
        </div>
        <div className="text-[11px] text-white/40 line-clamp-2 mt-0.5">
          {notification.message}
        </div>
        <div className="text-[10px] text-white/25 mt-1">
          {getTimeAgo(notification.createdAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1 rounded-md hover:bg-white/[0.08] text-white/30 hover:text-white/60 transition-colors"
            title="Mark as read"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1 rounded-md hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-0">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
          <div className="w-3.5 h-3.5 rounded bg-white/[0.06] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/[0.06] rounded w-3/4" />
            <div className="h-2.5 bg-white/[0.04] rounded w-full" />
            <div className="h-2 bg-white/[0.04] rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationBell({
  token,
  isAuthenticated,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    items,
    unreadCount,
    isLoading,
    error,
    hasFetched,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  // Fetch unread count on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUnreadCount(token);
    }
  }, [isAuthenticated, token, fetchUnreadCount]);

  // Refetch unread count on window focus
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const handleFocus = () => {
      fetchUnreadCount(token);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isAuthenticated, token, fetchUnreadCount]);

  // Fetch full notifications when dropdown opens
  const handleOpen = useCallback(() => {
    if (isAuthenticated && token) {
      fetchNotifications(token);
    }
  }, [isAuthenticated, token, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      handleOpen();
    }
  };

  const handleMarkAsRead = (id: string) => {
    if (token) markAsRead(token, id);
  };

  const handleMarkAllAsRead = () => {
    if (token) markAllAsRead(token);
  };

  const handleDelete = (id: string) => {
    if (token) deleteNotification(token, id);
  };

  const handleRetry = () => {
    if (token) fetchNotifications(token);
  };

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all relative"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-indigo-500 flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-white leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden shadow-xl shadow-black/50 z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-[10px] font-medium text-indigo-400">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[420px] overflow-y-auto scrollbar-none">
              {/* Loading State */}
              {isLoading && !hasFetched && <SkeletonLoader />}

              {/* Error State */}
              {error && (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-red-400/80 mb-3">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1.5 mx-auto px-3 py-1.5 bg-white/[0.06] text-white/50 rounded-lg hover:bg-white/[0.1] hover:text-white/70 transition-colors text-xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && items.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <Bell className="h-8 w-8 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">
                    No notifications yet
                  </p>
                </div>
              )}

              {/* Notification List */}
              {items.length > 0 && (
                <div className="divide-y divide-white/[0.04]">
                  <AnimatePresence mode="popLayout">
                    {items.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Loading overlay for refetch */}
              {isLoading && hasFetched && (
                <div className="absolute inset-0 bg-[#1a1a2e]/50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
