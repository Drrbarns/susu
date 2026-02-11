"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, MoreVertical, ShieldCheck, Ban,
  RotateCcw, Eye, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface Member {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: string;
  status: string;
  is_phone_verified?: boolean;
  created_at: string;
}

type UserAction = "verify" | "suspend" | "reactivate";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();

  // Action dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<Member | null>(null);
  const [actionType, setActionType] = useState<UserAction>("verify");

  // Dropdown open state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-members", search],
    queryFn: () =>
      api.get<{ members: Member[] }>(
        "/admin/members-list",
        search ? { search } : undefined
      ),
  });

  const actionMutation = useMutation({
    mutationFn: (payload: { user_id: string; action: UserAction }) =>
      api.post<{ success: boolean; message: string }>("/admin/verify-user", payload),
    onSuccess: (res) => {
      toast.success(
        "Success",
        (res as { message?: string }).message || "User updated successfully"
      );
      setActionDialogOpen(false);
      setActionTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
    onError: (err: { error?: string }) => {
      toast.error("Error", err.error || "Failed to update user");
    },
  });

  const members = data?.members || [];

  const openAction = (member: Member, action: UserAction) => {
    setActionTarget(member);
    setActionType(action);
    setActionDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmAction = () => {
    if (!actionTarget) return;
    actionMutation.mutate({ user_id: actionTarget.id, action: actionType });
  };

  const actionConfig: Record<UserAction, { label: string; description: string; icon: React.ReactNode; variant: "gold" | "destructive" | "default" }> = {
    verify: {
      label: "Verify User",
      description: "This will activate the user's account and mark their phone as verified. They will be able to use all platform features.",
      icon: <ShieldCheck className="h-5 w-5 text-green-600" />,
      variant: "gold",
    },
    suspend: {
      label: "Suspend User",
      description: "This will suspend the user's account. They will not be able to log in or access any platform features until reactivated.",
      icon: <Ban className="h-5 w-5 text-red-500" />,
      variant: "destructive",
    },
    reactivate: {
      label: "Reactivate User",
      description: "This will reactivate the user's suspended account and restore their access to all platform features.",
      icon: <RotateCcw className="h-5 w-5 text-blue-500" />,
      variant: "default",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Members</h1>
        <p className="text-muted-foreground">Manage all platform users</p>
      </div>

      <Input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="h-4 w-4" />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <Link
                          href={`/admin/users/${m.id}`}
                          className="flex items-center gap-3"
                        >
                          <Avatar name={m.full_name} size="sm" />
                          <div>
                            <p className="font-medium text-sm text-foreground">{m.full_name}</p>
                            {m.email && (
                              <p className="text-xs text-muted-foreground">{m.email}</p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                        {m.phone}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(m.created_at)}
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{m.role}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            m.status === "active"
                              ? "success"
                              : m.status === "suspended"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {m.status === "pending_verification" ? "Pending" : m.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="relative inline-block">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === m.id ? null : m.id);
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {openMenuId === m.id && (
                            <>
                              {/* Invisible backdrop to close menu */}
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                                {/* View profile */}
                                <Link
                                  href={`/admin/users/${m.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                  View Profile
                                </Link>

                                <div className="border-t border-border my-1" />

                                {/* Verify - only show if not already active */}
                                {m.status !== "active" && (
                                  <button
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openAction(m, "verify");
                                    }}
                                  >
                                    <ShieldCheck className="h-4 w-4" />
                                    Verify &amp; Activate
                                  </button>
                                )}

                                {/* Suspend - only show if active */}
                                {m.status === "active" && (
                                  <button
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openAction(m, "suspend");
                                    }}
                                  >
                                    <Ban className="h-4 w-4" />
                                    Suspend User
                                  </button>
                                )}

                                {/* Reactivate - only show if suspended */}
                                {m.status === "suspended" && (
                                  <button
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openAction(m, "reactivate");
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                    Reactivate User
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No members found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {actionConfig[actionType].icon}
              <DialogTitle>{actionConfig[actionType].label}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {actionTarget && (
                <span className="block mb-2 text-foreground font-medium">
                  {actionTarget.full_name} ({actionTarget.phone})
                </span>
              )}
              {actionConfig[actionType].description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setActionDialogOpen(false)}
              disabled={actionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={actionConfig[actionType].variant}
              onClick={confirmAction}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Processing...
                </>
              ) : (
                <>Confirm {actionConfig[actionType].label}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
