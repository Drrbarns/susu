"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Wallet, Users, ChevronRight, CircleDollarSign, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useDueContributions, useContributionStreak } from "@/hooks/use-contributions";
import { useWallet } from "@/hooks/use-wallet";
import { useGroups } from "@/hooks/use-groups";
import { formatCurrency } from "@/lib/utils";

function SavingsRing({ progress, total }: { progress: number; total: number }) {
  const pct = total > 0 ? Math.min((progress / total) * 100, 100) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" className="text-navy-800" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={radius} fill="none" stroke="url(#goldGradient)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#E4D18E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(pct)}%</span>
        <span className="text-xs text-navy-200">saved</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dueContributions, isLoading: dueLoading } = useDueContributions();
  const { data: streakData, isLoading: streakLoading } = useContributionStreak();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: groups, isLoading: groupsLoading } = useGroups();

  const totalDue = dueContributions?.reduce((sum, c) => sum + c.amount, 0) || 0;
  const dueCount = dueContributions?.length || 0;

  return (
    <div className="space-y-8">
      {/* Savings Overview */}
      <Card className="relative overflow-hidden bg-navy-900 text-white border-none shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="none" stroke="white" strokeWidth="0.5" />
            <path d="M0 100 C 30 20 70 20 100 100 Z" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gold-500/20 rounded-full blur-3xl" />
        
        <CardContent className="relative z-10 p-5 sm:p-8">
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="text-center sm:text-left">
              <p className="text-navy-200 text-xs sm:text-sm font-medium mb-2 uppercase tracking-wide">Total Savings</p>
              {walletLoading ? (
                <Skeleton className="h-10 w-40 bg-navy-800 mx-auto sm:mx-0" />
              ) : (
                <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {formatCurrency(wallet?.total_contributed || user?.totalSaved || 0)}
                </p>
              )}
              <div className="flex items-center gap-2 mt-4 bg-navy-800/50 w-fit px-3 py-1.5 rounded-full border border-navy-700 mx-auto sm:mx-0">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-green-400">On track for payout</span>
              </div>
            </div>
            <div className="flex justify-center sm:justify-end">
              <SavingsRing progress={wallet?.total_contributed || 0} total={(wallet?.total_contributed || 0) + totalDue} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-gold-500">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4 sm:flex-col sm:text-center">
            <div className="w-10 h-10 shrink-0 sm:mx-auto bg-gold-100 dark:bg-gold-900/20 rounded-full flex items-center justify-center sm:mb-2">
              <Wallet className="h-5 w-5 text-gold-600" />
            </div>
            <div className="sm:contents">
              {walletLoading ? <Skeleton className="h-6 w-20 sm:mx-auto" /> : (
                <p className="text-lg sm:text-xl font-bold text-foreground">{formatCurrency(wallet?.balance || 0)}</p>
              )}
              <p className="text-xs text-muted-foreground font-medium uppercase sm:mt-1 ml-auto sm:ml-0">Wallet Balance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-orange-500">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4 sm:flex-col sm:text-center">
            <div className="w-10 h-10 shrink-0 sm:mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center sm:mb-2">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div className="sm:contents">
              {streakLoading ? <Skeleton className="h-6 w-12 sm:mx-auto" /> : (
                <p className="text-lg sm:text-xl font-bold text-foreground">{streakData?.streak || 0} days</p>
              )}
              <p className="text-xs text-muted-foreground font-medium uppercase sm:mt-1 ml-auto sm:ml-0">Savings Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4 sm:flex-col sm:text-center">
            <div className="w-10 h-10 shrink-0 sm:mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center sm:mb-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="sm:contents">
              {groupsLoading ? <Skeleton className="h-6 w-10 sm:mx-auto" /> : (
                <p className="text-lg sm:text-xl font-bold text-foreground">{groups?.length || 0}</p>
              )}
              <p className="text-xs text-muted-foreground font-medium uppercase sm:mt-1 ml-auto sm:ml-0">Active Groups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due Today */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Due Today</CardTitle>
            {dueCount > 0 && <Badge variant="warning">{dueCount} pending</Badge>}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {dueLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : dueContributions && dueContributions.length > 0 ? (
            <div className="space-y-3">
              {dueContributions.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <p className="font-medium text-sm text-foreground">{c.groups?.name || c.group_name || "Group"}</p>
                    <p className="text-xs text-muted-foreground">{c.status === "overdue" ? "Overdue" : "Due today"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatCurrency(c.amount)}</p>
                    <Badge variant={c.status === "overdue" ? "destructive" : "warning"} className="text-[10px]">
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {totalDue > 0 && (
                <Link href="/app/pay">
                  <Button variant="gold" className="w-full mt-2">
                    <CircleDollarSign className="h-4 w-4" />
                    Pay All ({formatCurrency(totalDue)})
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CircleDollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No contributions due today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Groups */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">My Groups</CardTitle>
            <Link href="/app/groups" className="text-sm text-gold-600 hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {groupsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="space-y-3">
              {groups.slice(0, 3).map((g) => (
                <Link key={g.id} href={`/app/groups/${g.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.member_count || 0}/{g.group_size} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">{formatCurrency(g.daily_amount)}/day</p>
                      <Badge variant={g.status === "active" ? "success" : "secondary"} className="text-[10px]">
                        {g.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground mb-3">No groups yet</p>
              <Link href="/app/groups">
                <Button variant="outline" size="sm">
                  Browse Groups <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
