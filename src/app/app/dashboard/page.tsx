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
        <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={radius} fill="none" stroke="currentColor" className="text-gold-500" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(pct)}%</span>
        <span className="text-xs text-gray-500">saved</span>
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
    <div className="space-y-6">
      {/* Savings Overview */}
      <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="relative z-10 p-5 sm:p-8">
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="text-center sm:text-left">
              <p className="text-gray-500 text-xs sm:text-sm font-medium mb-2 uppercase tracking-wide">Total Savings</p>
              {walletLoading ? (
                <Skeleton className="h-10 w-40 mx-auto sm:mx-0" />
              ) : (
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {formatCurrency(wallet?.total_contributed || user?.totalSaved || 0)}
                </p>
              )}
              <div className="flex items-center gap-2 mt-4 bg-green-50 dark:bg-green-900/20 w-fit px-3 py-1.5 rounded-full border border-green-100 dark:border-green-900 mx-auto sm:mx-0">
                <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">On track for payout</span>
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
        <Card className="shadow-sm hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4 sm:flex-col sm:text-center">
            <div className="w-10 h-10 shrink-0 sm:mx-auto bg-gold-50 dark:bg-gold-900/20 rounded-full flex items-center justify-center sm:mb-2">
              <Wallet className="h-5 w-5 text-gold-600 dark:text-gold-400" />
            </div>
            <div className="sm:contents">
              {walletLoading ? <Skeleton className="h-6 w-20 sm:mx-auto" /> : (
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(wallet?.balance || 0)}</p>
              )}
              <p className="text-xs text-gray-500 font-medium uppercase sm:mt-1 ml-auto sm:ml-0">Wallet Balance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4 sm:flex-col sm:text-center">
            <div className="w-10 h-10 shrink-0 sm:mx-auto bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center sm:mb-2">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="sm:contents">
              {streakLoading ? <Skeleton className="h-6 w-12 sm:mx-auto" /> : (
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{streakData?.streak || 0} days</p>
              )}
              <p className="text-xs text-gray-500 font-medium uppercase sm:mt-1 ml-auto sm:ml-0">Savings Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4 sm:flex-col sm:text-center">
            <div className="w-10 h-10 shrink-0 sm:mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center sm:mb-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="sm:contents">
              {groupsLoading ? <Skeleton className="h-6 w-10 sm:mx-auto" /> : (
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{groups?.length || 0}</p>
              )}
              <p className="text-xs text-gray-500 font-medium uppercase sm:mt-1 ml-auto sm:ml-0">Active Groups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due Today */}
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-gray-900 dark:text-white">Due Today</CardTitle>
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
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{c.groups?.name || c.group_name || "Group"}</p>
                    <p className="text-xs text-gray-500">{c.status === "overdue" ? "Overdue" : "Due today"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(c.amount)}</p>
                    <Badge variant={c.status === "overdue" ? "destructive" : "warning"} className="text-[10px]">
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {totalDue > 0 && (
                <Link href="/app/pay">
                  <Button className="w-full mt-2 bg-gold-600 hover:bg-gold-700 text-white">
                    <CircleDollarSign className="h-4 w-4 mr-2" />
                    Pay All ({formatCurrency(totalDue)})
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CircleDollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No contributions due today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Groups */}
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-gray-900 dark:text-white">My Groups</CardTitle>
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
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{g.name}</p>
                        <p className="text-xs text-gray-500">{g.member_count || 0}/{g.group_size} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{formatCurrency(g.daily_amount)}/day</p>
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
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-400 opacity-50" />
              <p className="text-sm text-gray-500 mb-3">No groups yet</p>
              <Link href="/app/groups">
                <Button variant="outline" size="sm">
                  Browse Groups <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
