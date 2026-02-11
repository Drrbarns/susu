"use client";

import { Bell, CircleDollarSign, Users, Megaphone, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, useMarkAllRead } from "@/hooks/use-notifications";
import { useState } from "react";

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  payment: { icon: CircleDollarSign, color: "text-gold-600 bg-gold-100 dark:bg-gold-900/30" },
  payout: { icon: CircleDollarSign, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  group: { icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  system: { icon: Megaphone, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
};

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const [page] = useState(1);
  const { data, isLoading, isError } = useNotifications(page);
  const markAllRead = useMarkAllRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            {markAllRead.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Failed to load notifications</p>
          <p className="text-sm">Please try again later</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = typeConfig[n.type] || typeConfig.system;
            const Icon = config.icon;

            return (
              <Card
                key={n.id}
                className={
                  !n.is_read
                    ? "border-gold-200 dark:border-gold-800 bg-gold-50/30 dark:bg-gold-900/5"
                    : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm text-foreground">{n.title}</h3>
                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getTimeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No notifications</p>
          <p className="text-sm">You are all caught up!</p>
        </div>
      )}
    </div>
  );
}
