"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: () =>
      api.get<NotificationsResponse>("/notifications/list", {
        page: String(page),
        limit: "20",
      }),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () =>
      api.get<NotificationsResponse>("/notifications/list", {
        page: "1",
        limit: "1",
      }),
    select: (data) => data.unread,
    refetchInterval: 15000, // Poll every 15 seconds
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      api.post("/notifications/mark-read", {
        action: "mark_read",
        notification_id: notificationId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post("/notifications/mark-all-read", {
        action: "mark_all_read",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
