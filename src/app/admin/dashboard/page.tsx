"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Banknote, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Activity, CircleDollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { AdminStats } from "@/types";

function KPICard({ title, value, subtitle, icon: Icon, trend, trendUp, delay }: {
  title: string; value: string; subtitle?: string; icon: typeof Users; trend?: string; trendUp?: boolean; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card>
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">{title}</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{value}</p>
              {subtitle && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center shrink-0 ml-2">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<AdminStats>("/admin/dashboard-kpis"),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your susu platform</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="h-24 sm:h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard title="Total Users" value={String(stats?.total_users || 0)} icon={Users} trend="+12 this week" trendUp delay={0} />
          <KPICard title="Active Groups" value={String(stats?.active_groups || 0)} subtitle={`${stats?.total_groups || 0} total`} icon={Users} delay={0.05} />
          <KPICard title="Total Contributed" value={formatCurrency(stats?.total_contributed || 0)} icon={CircleDollarSign} trend="+8.2%" trendUp delay={0.1} />
          <KPICard title="Total Paid Out" value={formatCurrency(stats?.total_paid_out || 0)} icon={Banknote} delay={0.15} />
          <KPICard title="Today's Contributions" value={String(stats?.today_contributions || 0)} icon={Activity} delay={0.2} />
          <KPICard title="Active Memberships" value={String(stats?.active_memberships || 0)} icon={Users} delay={0.25} />
          <KPICard title="Pending Requests" value={String(stats?.pending_requests || 0)} icon={Users} delay={0.3} />
          <KPICard title="Pending Withdrawals" value={String(stats?.pending_withdrawals || 0)} icon={Wallet} delay={0.35} />
        </div>
      )}

      {/* Revenue */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Contributed</span>
                <span className="font-medium">{formatCurrency(stats?.total_contributed || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Paid Out</span>
                <span className="font-medium">{formatCurrency(stats?.total_paid_out || 0)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-sm font-semibold">Platform Fees</span>
                <span className="font-bold text-gold-600">{formatCurrency(stats?.profit || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "View Groups", href: "/admin/groups", icon: Users },
                { label: "Manage Payouts", href: "/admin/payouts", icon: Banknote },
                { label: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
                { label: "Audit Logs", href: "/admin/audit", icon: Activity },
              ].map((action) => (
                <a key={action.href} href={action.href} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center">
                  <action.icon className="h-5 w-5 text-gold-600" />
                  <span className="text-xs font-medium">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
