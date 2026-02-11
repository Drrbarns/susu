"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Users, Calendar, CircleDollarSign, Clock, Trash2,
  Shield, Loader2, AlertTriangle, Edit, Play, Pause, CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useDeleteGroup } from "@/hooks/use-groups";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GROUP_STATUSES } from "@/lib/constants";

interface GroupDetail {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  group_size: number;
  daily_amount: number;
  days_per_turn: number;
  payout_amount: number;
  join_fee: number;
  currency: string;
  grace_period_hours: number;
  late_fee: number;
  category?: string;
  start_date?: string;
  end_date?: string;
  current_turn: number;
  member_count: number;
  pending_requests: number;
  spots_left: number;
  is_full: boolean;
  created_at: string;
  created_by?: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  status: string;
  turn_position?: number;
  joined_at?: string;
  total_contributed?: number;
  users?: {
    id: string;
    full_name: string;
    phone: string;
    profile_photo_url?: string;
  };
}

export default function AdminGroupDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const deleteGroup = useDeleteGroup();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const { data: groupData, isLoading, error } = useQuery({
    queryKey: ["admin-group-detail", id],
    queryFn: () => api.get<{ data?: GroupDetail; group?: GroupDetail }>("/groups/detail", { groupId: id as string }),
    enabled: !!id,
  });

  const group = groupData?.data || groupData?.group;

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["admin-group-members", id],
    queryFn: () => api.get<{ data?: GroupMember[]; members?: GroupMember[] }>("/groups/members", { group_id: id as string }),
    enabled: !!id,
  });

  const members = membersData?.data || membersData?.members || [];

  const handleDelete = () => {
    if (!group) return;
    deleteGroup.mutate(group.id, {
      onSuccess: () => {
        toast.success("Group Deleted", `"${group.name}" has been deleted.`);
        router.push("/admin/groups");
      },
      onError: (err: Error) => {
        const msg = (err as Error & { error?: string }).error ?? err.message ?? "Failed to delete group";
        toast.error("Error", msg);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-3" />
            <p className="text-muted-foreground">Failed to load group details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = GROUP_STATUSES[group.status as keyof typeof GROUP_STATUSES] || GROUP_STATUSES.draft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{group.name}</h1>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            <Badge variant="secondary">{group.type}</Badge>
          </div>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Members"
          value={`${group.member_count}/${group.group_size}`}
          sub={`${group.spots_left} spots left`}
          icon={<Users className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          label="Daily Contribution"
          value={formatCurrency(group.daily_amount)}
          sub={`${group.days_per_turn} day${group.days_per_turn > 1 ? 's' : ''} per turn`}
          icon={<CircleDollarSign className="h-5 w-5 text-gold-500" />}
        />
        <StatCard
          label="Payout Amount"
          value={formatCurrency(group.payout_amount)}
          sub={group.join_fee > 0 ? `Join fee: ${formatCurrency(group.join_fee)}` : "No join fee"}
          icon={<Shield className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          label="Current Turn"
          value={`${group.current_turn}`}
          sub={`Created ${formatDate(group.created_at)}`}
          icon={<Clock className="h-5 w-5 text-purple-500" />}
        />
      </div>

      {/* Group Configuration */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Group Configuration</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <ConfigItem label="Currency" value={group.currency || "GHS"} />
            <ConfigItem label="Grace Period" value={`${group.grace_period_hours} hours`} />
            <ConfigItem label="Late Fee" value={group.late_fee > 0 ? formatCurrency(group.late_fee) : "None"} />
            <ConfigItem label="Category" value={group.category || "General"} />
            {group.start_date && <ConfigItem label="Start Date" value={formatDate(group.start_date)} />}
            {group.end_date && <ConfigItem label="End Date" value={formatDate(group.end_date)} />}
            <ConfigItem label="Pending Requests" value={`${group.pending_requests}`} />
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Members ({members.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Member</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Phone</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Position</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Contributed</th>
                </tr>
              </thead>
              <tbody>
                {membersLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center">
                      <Skeleton className="h-6 w-40 mx-auto" />
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                      No members have joined this group yet
                    </td>
                  </tr>
                ) : (
                  members.map((m: GroupMember) => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 text-sm">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={m.users?.full_name || "User"} size="sm" />
                          <span className="font-medium text-foreground">{m.users?.full_name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground">{m.users?.phone || "—"}</td>
                      <td className="p-3">
                        {m.turn_position != null ? (
                          <Badge variant="secondary" className="text-xs">#{m.turn_position}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={m.status === "active" ? "success" : m.status === "pending" ? "warning" : "secondary"}
                          className="text-xs"
                        >
                          {m.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right hidden md:table-cell font-medium">
                        {m.total_contributed != null ? formatCurrency(m.total_contributed) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle>Delete Group</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              This action is <span className="font-semibold text-destructive">permanent and irreversible</span>.
              All memberships and contribution schedules for this group will also be deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium text-foreground">{group.name}</p>
            <p className="text-xs text-muted-foreground">
              {group.member_count} member{group.member_count !== 1 ? 's' : ''} &middot; {formatCurrency(group.daily_amount)}/day &middot; {group.status}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Type <span className="font-mono text-destructive">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); }} disabled={deleteGroup.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirm !== "DELETE" || deleteGroup.isPending}
            >
              {deleteGroup.isPending ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-1" /> Delete Group</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          {icon}
        </div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
