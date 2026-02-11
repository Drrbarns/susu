"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, Clock, Coins, Shield, UserPlus, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGroupDetail, useGroupMembers, useJoinGroup, useLeaveGroup } from "@/hooks/use-groups";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GROUP_STATUSES } from "@/lib/constants";

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: group, isLoading } = useGroupDetail(id);
  const { data: members, isLoading: membersLoading } = useGroupMembers(id);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Group not found</p>
        <Link href="/app/groups"><Button variant="outline" className="mt-4">Back to Groups</Button></Link>
      </div>
    );
  }

  const statusConfig = GROUP_STATUSES[group.status as keyof typeof GROUP_STATUSES] || GROUP_STATUSES.draft;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/app/groups" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{group.name}</h1>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </div>

      {/* Stats */}
      <Card className="bg-gradient-to-br from-navy-900 to-navy-800 text-white border-none">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-gray-400 text-[10px] sm:text-xs">Daily Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-gold-400">{formatCurrency(group.daily_amount)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] sm:text-xs">Payout</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{formatCurrency(group.payout_amount)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
            <div className="bg-white/10 rounded-lg p-1.5 sm:p-2 text-center">
              <Users className="h-3.5 sm:h-4 w-3.5 sm:w-4 mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs">{group.member_count || 0}/{group.group_size}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-1.5 sm:p-2 text-center">
              <Calendar className="h-3.5 sm:h-4 w-3.5 sm:w-4 mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs">{group.days_per_turn}d/turn</p>
            </div>
            <div className="bg-white/10 rounded-lg p-1.5 sm:p-2 text-center">
              <Clock className="h-3.5 sm:h-4 w-3.5 sm:w-4 mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs">{group.grace_period_hours}h grace</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {group.can_join ? (
          <Button variant="gold" className="flex-1" onClick={() => joinGroup.mutate({ groupId: group.id })} loading={joinGroup.isPending}>
            <UserPlus className="h-4 w-4" /> Join Group
          </Button>
        ) : group.user_membership ? (
          <Button variant="outline" className="flex-1" onClick={() => leaveGroup.mutate({ groupId: group.id })} loading={leaveGroup.isPending}>
            <LogOut className="h-4 w-4" /> Leave Group
          </Button>
        ) : null}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="w-full">
          <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
          <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
          <TabsTrigger value="rules" className="flex-1">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="p-4 space-y-3">
              {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Join Fee: {formatCurrency(group.join_fee)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Late Fee: {formatCurrency(group.late_fee)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Type: {group.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Started: {group.start_date ? formatDate(group.start_date) : "TBD"}</span>
                </div>
              </div>
              {group.user_turn_position && (
                <div className="bg-gold-50 dark:bg-gold-900/20 rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Your Turn Position</p>
                  <p className="text-2xl font-bold text-gold-600">#{group.user_turn_position}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="p-4">
              {membersLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : members && (members as Array<{ id: string; user?: { full_name: string; phone: string; profile_photo_url?: string }; turn_position?: number; status: string }>).length > 0 ? (
                <div className="space-y-2">
                  {(members as Array<{ id: string; user?: { full_name: string; phone: string; profile_photo_url?: string }; turn_position?: number; status: string }>).map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.user?.full_name || "Member"} src={m.user?.profile_photo_url} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.user?.full_name || "Member"}</p>
                          <p className="text-xs text-muted-foreground">{m.user?.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {m.turn_position && <p className="text-xs text-muted-foreground">Turn #{m.turn_position}</p>}
                        <Badge variant={m.status === "active" ? "success" : "secondary"} className="text-[10px]">{m.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6 text-sm">No members yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardContent className="p-4">
              {group.rules_text ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{group.rules_text}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Standard group rules apply. See <Link href="/group-rules" className="text-gold-600 underline">Group Rules</Link> for details.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
