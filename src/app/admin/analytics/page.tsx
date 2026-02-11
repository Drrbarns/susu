"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign, Users, Layers, CalendarCheck, CreditCard, Shield,
  TrendingUp, TrendingDown, Wallet, Activity, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Phone, UserCheck, CheckCircle,
  XCircle, Clock, BarChart3, PieChart, MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend,
} from "recharts";

// -- Color palette --
const COLORS = ["#c9a84c", "#1a2744", "#3b82f6", "#ef4444", "#22c55e", "#f97316", "#8b5cf6", "#06b6d4"];
const GOLD = "#c9a84c";
const NAVY = "#1a2744";

// -- Types --
interface AnalyticsData {
  financial: {
    walletSummary: { total_balance: number; total_deposited: number; total_withdrawn: number; total_contributed: number; total_received: number; payout_total: number; wallet_count: number };
    dailyVolume: Array<{ date: string; count: number; volume: number }>;
    transactionTypes: Array<{ type: string; count: number; total: number }>;
    paymentFees: number;
    withdrawalFees: number;
    lateFees: number;
    joinFees: number;
  };
  users: {
    byStatus: Array<{ status: string; count: number }>;
    growth: { last_7: number; last_30: number; total: number };
    dailySignups: Array<{ date: string; count: number }>;
    kycBreakdown: Array<{ kyc_status: string; count: number }>;
    byRole: Array<{ role: string; count: number }>;
    topByBalance: Array<{ full_name: string; phone: string; balance: number }>;
    referralStats: { referred_users: number; referrers: number };
    inactiveCount: number;
    phoneVerification: { verified: number; total: number };
  };
  groups: {
    byStatus: Array<{ status: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    topGroups: Array<{ id: string; name: string; group_size: number; status: string; daily_amount: number; payout_amount: number; current_turn: number; member_count: number }>;
    totalPotentialPayout: number;
  };
  contributions: {
    scheduleStatus: Array<{ status: string; count: number; total: number }>;
    paymentStats: { count: number; total: number; late_fees: number; late_count: number };
    dailyVolume: Array<{ date: string; count: number; volume: number }>;
    todayDue: { total_due: number; paid: number; unpaid: number };
  };
  payments: {
    intentStatus: Array<{ status: string; count: number; total: number }>;
    monthStats: { count: number; volume: number; fees: number; avg_amount: number };
    dailyVolume: Array<{ date: string; count: number; volume: number }>;
  };
  withdrawals: {
    byStatus: Array<{ status: string; count: number; total: number }>;
    monthStats: { count: number; volume: number; fees: number };
  };
  sms: {
    byStatus: Array<{ status: string; count: number; cost: number }>;
    dailyTrend: Array<{ date: string; count: number }>;
  };
  risk: {
    topMissers: Array<{ full_name: string; phone: string; contributions_missed: number; group_name: string }>;
    recentAudit: Array<{ action: string; entity_type: string; resource_type: string; created_at: string; full_name: string }>;
  };
}

// -- Helper components --
function KPI({ label, value, sub, icon: Icon, trend, color = "gold" }: {
  label: string; value: string; sub?: string; icon: typeof DollarSign; trend?: { value: string; up: boolean }; color?: string;
}) {
  const colorMap: Record<string, string> = {
    gold: "border-gold-500 text-gold-600 bg-gold-50 dark:bg-gold-900/10",
    green: "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/10",
    red: "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/10",
    blue: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/10",
  };
  const styles = colorMap[color] || colorMap.gold;
  
  return (
    <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${styles.split(' ')[0]}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-lg sm:text-2xl font-bold text-navy-900 dark:text-white mt-0.5 sm:mt-1 truncate">{value}</p>
            {sub && <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
          </div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ml-2 ${styles.split(' ').slice(2).join(' ')}`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${styles.split(' ')[1]}`} />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full w-fit ${trend.up ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-red-100 text-red-700 dark:bg-red-900/30"}`}>
            {trend.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            <span className="truncate">{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col space-y-1 mb-4">
      <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
        <span className="w-1 h-5 bg-gold-500 rounded-full" />
        {title}
      </h3>
      {subtitle && <p className="text-sm text-muted-foreground ml-3">{subtitle}</p>}
    </div>
  );
}

function MiniTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className={`py-2 px-3 text-xs font-medium text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="py-6 text-center text-xs text-muted-foreground">No data</td></tr>
          ) : rows.map((cells, i) => (
            <tr key={i} className="border-b border-border/30 hover:bg-muted/20">
              {cells.map((cell, j) => (
                <td key={j} className={`py-2 px-3 ${j === 0 ? "text-left font-medium" : "text-right text-muted-foreground"}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProgressBar({ label, value, max, color = GOLD }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value} / {max}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const v = status.toLowerCase();
  const variant = v === "active" || v === "completed" || v === "paid" || v === "verified" || v === "sent" || v === "delivered" || v === "approved" || v === "processed"
    ? "success" : v === "pending" || v === "draft" || v === "not_submitted" ? "warning"
    : v === "suspended" || v === "failed" || v === "rejected" || v === "missed" || v === "overdue" ? "destructive" : "secondary";
  return <Badge variant={variant} className="text-[10px] px-1.5 py-0">{status.replace(/_/g, " ")}</Badge>;
}

const shortDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}`;
};

const tooltipStyle = { contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 } };

// ===== MAIN PAGE =====
export default function AdminAnalyticsPage() {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get<AnalyticsData>("/admin/analytics"),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted-foreground">Loading platform data...</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-24 sm:h-28" />)}</div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Analytics</h1></div>
        <Card><CardContent className="py-12 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-3" />
          <p className="text-muted-foreground">Failed to load analytics data. Try refreshing.</p>
        </CardContent></Card>
      </div>
    );
  }

  const { financial: fin, users: usr, groups: grp, contributions: ctr, payments: pay, withdrawals: wdr, sms, risk } = data;
  const totalRevenue = Number(fin.paymentFees) + Number(fin.withdrawalFees) + Number(fin.lateFees) + Number(fin.joinFees);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-navy-900 text-white p-5 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white mb-1 sm:mb-2">Analytics Command Center</h1>
          <p className="text-navy-100 flex items-center gap-2 text-xs sm:text-sm">
            <Activity className="h-4 w-4 text-gold-400 shrink-0" />
            <span>Platform intelligence &bull; Auto-refreshes every 60s</span>
          </p>
        </div>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 -mt-4 sm:-mt-6">
        <KPI label="Platform Balance" value={formatCurrency(fin.walletSummary.total_balance)} sub={`${fin.walletSummary.wallet_count} active wallets`} icon={Wallet} color="gold" />
        <KPI label="Total Users" value={String(usr.growth.total)} sub={`+${usr.growth.last_7} this week`} icon={Users} color="blue" trend={{ value: `+${usr.growth.last_30} this month`, up: true }} />
        <KPI label="Total Revenue" value={formatCurrency(totalRevenue)} sub="Fees + penalties" icon={DollarSign} color="green" />
        <KPI label="Money Flowing" value={formatCurrency(fin.walletSummary.total_deposited)} sub={`${formatCurrency(fin.walletSummary.total_withdrawn)} withdrawn`} icon={Activity} color="gold" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="financial" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <div className="bg-card rounded-lg p-1 shadow-sm border inline-flex min-w-max">
            <TabsList className="bg-transparent p-0 h-auto gap-0.5 sm:gap-1">
              <TabsTrigger value="financial" className="data-[state=active]:bg-navy-50 data-[state=active]:text-navy-900 data-[state=active]:shadow-sm py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm"><DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" /><span className="hidden xs:inline">Financial</span><span className="xs:hidden">Finance</span></TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-navy-50 data-[state=active]:text-navy-900 data-[state=active]:shadow-sm py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm"><Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />Users</TabsTrigger>
              <TabsTrigger value="groups" className="data-[state=active]:bg-navy-50 data-[state=active]:text-navy-900 data-[state=active]:shadow-sm py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm"><Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />Groups</TabsTrigger>
              <TabsTrigger value="contributions" className="data-[state=active]:bg-navy-50 data-[state=active]:text-navy-900 data-[state=active]:shadow-sm py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm"><CalendarCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" /><span className="hidden sm:inline">Contributions</span><span className="sm:hidden">Contribs</span></TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-navy-50 data-[state=active]:text-navy-900 data-[state=active]:shadow-sm py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm"><CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" /><span className="hidden sm:inline">Payments</span><span className="sm:hidden">Pay</span></TabsTrigger>
              <TabsTrigger value="risk" className="data-[state=active]:bg-navy-50 data-[state=active]:text-navy-900 data-[state=active]:shadow-sm py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm"><Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" /><span className="hidden sm:inline">Risk &amp; SMS</span><span className="sm:hidden">Risk</span></TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ===== FINANCIAL TAB ===== */}
        <TabsContent value="financial" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <SectionHeader title="Financial Overview" subtitle="Detailed breakdown of platform funds and revenue" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KPI label="Total Deposited" value={formatCurrency(fin.walletSummary.total_deposited)} icon={TrendingUp} color="green" />
            <KPI label="Total Withdrawn" value={formatCurrency(fin.walletSummary.total_withdrawn)} icon={TrendingDown} color="red" />
            <KPI label="Total Contributed" value={formatCurrency(fin.walletSummary.total_contributed)} icon={CalendarCheck} color="gold" />
            <KPI label="Total Payouts" value={formatCurrency(fin.walletSummary.payout_total)} icon={Wallet} color="blue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue breakdown */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payment Fees</span><span className="font-medium">{formatCurrency(fin.paymentFees)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Withdrawal Fees</span><span className="font-medium">{formatCurrency(fin.withdrawalFees)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Late Fees</span><span className="font-medium">{formatCurrency(fin.lateFees)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Join Fees</span><span className="font-medium">{formatCurrency(fin.joinFees)}</span></div>
                <div className="border-t pt-2 flex justify-between text-sm"><span className="font-semibold">Total Revenue</span><span className="font-bold text-gold-600">{formatCurrency(totalRevenue)}</span></div>
              </CardContent>
            </Card>

            {/* Transaction type pie chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Transaction Types</CardTitle></CardHeader>
              <CardContent>
                {fin.transactionTypes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie data={fin.transactionTypes} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        label={(props: any) => `${props.name || ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {fin.transactionTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Tooltip formatter={(v: any) => [v, "Transactions"]} {...tooltipStyle} />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-sm text-muted-foreground py-8">No transactions yet</p>}
              </CardContent>
            </Card>

            {/* Money flow summary */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Money Flow</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {fin.transactionTypes.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground capitalize">{t.type.replace(/_/g, " ")}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{formatCurrency(t.total)}</span>
                      <span className="text-xs text-muted-foreground ml-1">({t.count})</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Transaction volume chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Transaction Volume (Last 30 Days)</CardTitle></CardHeader>
            <CardContent>
              {fin.dailyVolume.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={fin.dailyVolume}>
                    <defs>
                      <linearGradient id="gradVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${v}`} />
                    <Tooltip formatter={(v: any) => [formatCurrency(v), "Volume"]} labelFormatter={(l: any) => formatDate(l)} {...tooltipStyle} />
                    <Area type="monotone" dataKey="volume" stroke={GOLD} fill="url(#gradVol)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-sm text-muted-foreground py-12">No transaction data for this period</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== USERS TAB ===== */}
        <TabsContent value="users" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <SectionHeader title="User Growth & Activity" subtitle="Track user acquisition and engagement metrics" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KPI label="Total Users" value={String(usr.growth.total)} icon={Users} color="blue" />
            <KPI label="New This Week" value={`+${usr.growth.last_7}`} sub="Last 7 days" icon={UserCheck} color="green" trend={{ value: `+${usr.growth.last_30} this month`, up: true }} />
            <KPI label="Phone Verified" value={`${usr.phoneVerification.verified}/${usr.phoneVerification.total}`} sub={`${usr.phoneVerification.total > 0 ? Math.round((usr.phoneVerification.verified / usr.phoneVerification.total) * 100) : 0}% rate`} icon={Phone} color="green" />
            <KPI label="Inactive (30d)" value={String(usr.inactiveCount)} sub="No login in 30 days" icon={Clock} color="red" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* User growth chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Daily Signups (Last 30 Days)</CardTitle></CardHeader>
              <CardContent>
                {usr.dailySignups.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={usr.dailySignups}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v: any) => [v, "Signups"]} labelFormatter={(l: any) => formatDate(l)} {...tooltipStyle} />
                      <Bar dataKey="count" fill={NAVY} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-sm text-muted-foreground py-12">No signups this period</p>}
              </CardContent>
            </Card>

            {/* KYC breakdown */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">KYC Verification Status</CardTitle></CardHeader>
              <CardContent>
                {usr.kycBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RePieChart>
                      <Pie data={usr.kycBreakdown} dataKey="count" nameKey="kyc_status" cx="50%" cy="50%" outerRadius={80} // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        label={(props: any) => `${(props.kyc_status || '').replace(/_/g, " ")} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {usr.kycBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-sm text-muted-foreground py-12">No KYC data</p>}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Users by status & role */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Users by Status</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {usr.byStatus.map((s, i) => (
                    <ProgressBar key={i} label={s.status} value={s.count} max={usr.growth.total} color={s.status === "active" ? "#22c55e" : s.status === "suspended" ? "#ef4444" : "#f97316"} />
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">By Role</p>
                  {usr.byRole.map((r, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{r.role.replace(/_/g, " ")}</span>
                      <span className="font-medium">{r.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Referrals</p>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Users from referrals</span><span className="font-medium">{usr.referralStats.referred_users}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active referrers</span><span className="font-medium">{usr.referralStats.referrers}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Top users by balance */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Users by Balance</CardTitle></CardHeader>
              <CardContent className="p-0 px-1">
                <MiniTable
                  headers={["#", "User", "Balance"]}
                  rows={usr.topByBalance.map((u, i) => [
                    <span key="r" className="text-muted-foreground">{i + 1}</span>,
                    <span key="n">{u.full_name}</span>,
                    <span key="b" className="font-medium text-foreground">{formatCurrency(u.balance)}</span>,
                  ])}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== GROUPS TAB ===== */}
        <TabsContent value="groups" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <SectionHeader title="Group Performance" subtitle="Monitor group creation, status, and health" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KPI label="Total Groups" value={String(grp.byStatus.reduce((a, b) => a + b.count, 0))} icon={Layers} color="blue" />
            <KPI label="Active Groups" value={String(grp.byStatus.find(s => s.status === "active")?.count || 0)} icon={Activity} color="green" />
            <KPI label="Total Potential Payout" value={formatCurrency(grp.totalPotentialPayout)} sub="All active groups" icon={DollarSign} color="gold" />
            <KPI label="Group Types" value={grp.byType.map(t => `${t.count} ${t.type}`).join(", ") || "—"} icon={PieChart} color="blue" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Groups by status pie */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Groups by Status</CardTitle></CardHeader>
              <CardContent>
                {grp.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RePieChart>
                      <Pie data={grp.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        label={(props: any) => `${props.status} (${props.count})`} labelLine={false} fontSize={10}>
                        {grp.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-sm text-muted-foreground py-12">No groups</p>}
              </CardContent>
            </Card>

            {/* Group fill rates */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Group Fill Rates</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {grp.topGroups.slice(0, 8).map((g, i) => (
                  <ProgressBar key={i} label={`${g.name} (${g.status})`} value={g.member_count} max={g.group_size} color={g.member_count >= g.group_size ? "#22c55e" : GOLD} />
                ))}
                {grp.topGroups.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No groups created yet</p>}
              </CardContent>
            </Card>
          </div>

          {/* All groups table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">All Groups Overview</CardTitle></CardHeader>
            <CardContent className="p-0 px-1">
              <MiniTable
                headers={["Group", "Status", "Members", "Daily", "Payout", "Turn"]}
                rows={grp.topGroups.map(g => [
                  <span key="n">{g.name}</span>,
                  <StatusPill key="s" status={g.status} />,
                  <span key="m">{g.member_count}/{g.group_size}</span>,
                  <span key="d">{formatCurrency(g.daily_amount)}</span>,
                  <span key="p" className="font-medium text-foreground">{formatCurrency(g.payout_amount)}</span>,
                  <span key="t">{g.current_turn || 0}/{g.group_size}</span>,
                ])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== CONTRIBUTIONS TAB ===== */}
        <TabsContent value="contributions" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <SectionHeader title="Contribution Tracking" subtitle="Monitor payment compliance and schedules" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KPI label="Total Paid" value={formatCurrency(ctr.paymentStats.total)} sub={`${ctr.paymentStats.count} payments`} icon={CheckCircle} color="green" />
            <KPI label="Late Contributions" value={String(ctr.paymentStats.late_count)} sub={`${formatCurrency(ctr.paymentStats.late_fees)} in late fees`} icon={Clock} color="red" />
            <KPI label="Today's Due" value={String(ctr.todayDue.total_due)} sub={`${ctr.todayDue.paid} paid, ${ctr.todayDue.unpaid} unpaid`} icon={CalendarCheck} color="gold" />
            <KPI
              label="Compliance Rate"
              value={(() => {
                const total = ctr.scheduleStatus.reduce((a, b) => a + b.count, 0);
                const paid = ctr.scheduleStatus.find(s => s.status === "paid")?.count || 0;
                return total > 0 ? `${Math.round((paid / total) * 100)}%` : "N/A";
              })()}
              sub="Paid vs scheduled"
              icon={BarChart3}
              color="blue"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Contribution schedule status */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Schedule Status Breakdown</CardTitle></CardHeader>
              <CardContent>
                {ctr.scheduleStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ctr.scheduleStatus} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={70} />
                      <Tooltip formatter={(v: any) => [v, "Count"]} {...tooltipStyle} />
                      <Bar dataKey="count" fill={GOLD} radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-sm text-muted-foreground py-12">No schedule data</p>}
              </CardContent>
            </Card>

            {/* Daily contributions chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Daily Contribution Volume (30d)</CardTitle></CardHeader>
              <CardContent>
                {ctr.dailyVolume.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={ctr.dailyVolume}>
                      <defs>
                        <linearGradient id="gradCtr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${v}`} />
                      <Tooltip formatter={(v: any) => [formatCurrency(v), "Volume"]} labelFormatter={(l: any) => formatDate(l)} {...tooltipStyle} />
                      <Area type="monotone" dataKey="volume" stroke="#22c55e" fill="url(#gradCtr)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-sm text-muted-foreground py-12">No contributions this period</p>}
              </CardContent>
            </Card>
          </div>

          {/* Schedule amount breakdown table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Amount by Status</CardTitle></CardHeader>
            <CardContent className="p-0 px-1">
              <MiniTable
                headers={["Status", "Count", "Total Amount"]}
                rows={ctr.scheduleStatus.map(s => [
                  <StatusPill key="s" status={s.status} />,
                  <span key="c">{s.count}</span>,
                  <span key="t" className="font-medium text-foreground">{formatCurrency(s.total)}</span>,
                ])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PAYMENTS TAB ===== */}
        <TabsContent value="payments" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <SectionHeader title="Payment Processing" subtitle="Transaction volume and gateway performance" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KPI label="This Month Volume" value={formatCurrency(pay.monthStats.volume)} sub={`${pay.monthStats.count} transactions`} icon={CreditCard} color="gold" />
            <KPI label="Avg Transaction" value={formatCurrency(pay.monthStats.avg_amount)} sub="This month" icon={BarChart3} color="blue" />
            <KPI label="Fees Collected" value={formatCurrency(pay.monthStats.fees)} sub="This month" icon={DollarSign} color="green" />
            <KPI
              label="Success Rate"
              value={(() => {
                const total = pay.intentStatus.reduce((a, b) => a + b.count, 0);
                const completed = pay.intentStatus.find(s => s.status === "completed")?.count || 0;
                return total > 0 ? `${Math.round((completed / total) * 100)}%` : "N/A";
              })()}
              icon={CheckCircle}
              color="green"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Payment volume chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Payment Volume (30d)</CardTitle></CardHeader>
              <CardContent>
                {pay.dailyVolume.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={pay.dailyVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${v}`} />
                      <Tooltip formatter={(v: any) => [formatCurrency(v), "Volume"]} labelFormatter={(l: any) => formatDate(l)} {...tooltipStyle} />
                      <Bar dataKey="volume" fill={GOLD} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-sm text-muted-foreground py-12">No payment data this period</p>}
              </CardContent>
            </Card>

            {/* Payment intent status */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Payment Intent Status</CardTitle></CardHeader>
              <CardContent>
                {pay.intentStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RePieChart>
                      <Pie data={pay.intentStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        label={(props: any) => `${props.status} (${props.count})`} labelLine={false} fontSize={10}>
                        {pay.intentStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-sm text-muted-foreground py-12">No payment intents</p>}
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal stats */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Withdrawals This Month</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Count</span><span className="font-medium">{wdr.monthStats.count}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Volume</span><span className="font-medium">{formatCurrency(wdr.monthStats.volume)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fees Collected</span><span className="font-medium">{formatCurrency(wdr.monthStats.fees)}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Withdrawal Status Breakdown</CardTitle></CardHeader>
              <CardContent className="p-0 px-1">
                <MiniTable
                  headers={["Status", "Count", "Total"]}
                  rows={wdr.byStatus.map(s => [
                    <StatusPill key="s" status={s.status} />,
                    <span key="c">{s.count}</span>,
                    <span key="t" className="font-medium text-foreground">{formatCurrency(s.total)}</span>,
                  ])}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== RISK & SMS TAB ===== */}
        <TabsContent value="risk" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <SectionHeader title="Risk & Notifications" subtitle="Identify potential issues and communication metrics" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KPI label="Contribution Missers" value={String(risk.topMissers.length)} sub="Users with missed contributions" icon={AlertTriangle} color="red" />
            <KPI label="SMS Sent" value={String(sms.byStatus.reduce((a, b) => a + b.count, 0))} icon={MessageSquare} color="blue" />
            <KPI label="SMS Cost" value={formatCurrency(sms.byStatus.reduce((a, b) => a + Number(b.cost), 0))} sub="Total spent" icon={DollarSign} color="gold" />
            <KPI label="Audit Events" value={String(risk.recentAudit.length)} sub="Recent activity" icon={Shield} color="blue" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Top missers */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> High-Risk: Missed Contributions</CardTitle></CardHeader>
              <CardContent className="p-0 px-1">
                <MiniTable
                  headers={["User", "Group", "Missed"]}
                  rows={risk.topMissers.map(m => [
                    <span key="n">{m.full_name}</span>,
                    <span key="g" className="text-xs">{m.group_name}</span>,
                    <Badge key="c" variant="destructive" className="text-xs">{m.contributions_missed}</Badge>,
                  ])}
                />
              </CardContent>
            </Card>

            {/* SMS stats */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">SMS Delivery Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {sms.byStatus.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <StatusPill status={s.status} />
                      <div className="text-right">
                        <span className="font-medium">{s.count}</span>
                        <span className="text-xs text-muted-foreground ml-1">(₵{Number(s.cost).toFixed(2)})</span>
                      </div>
                    </div>
                  ))}
                  {sms.byStatus.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No SMS sent yet</p>}
                </div>
                {sms.dailyTrend.length > 0 && (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={sms.dailyTrend}>
                      <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip formatter={(v: any) => [v, "SMS Sent"]} labelFormatter={(l: any) => formatDate(l)} {...tooltipStyle} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent audit trail */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Admin Audit Trail</CardTitle></CardHeader>
            <CardContent className="p-0 px-1">
              <MiniTable
                headers={["Time", "User", "Action", "Resource"]}
                rows={risk.recentAudit.map(a => [
                  <span key="t" className="text-xs">{a.created_at ? formatDate(a.created_at, "relative") : "—"}</span>,
                  <span key="u">{a.full_name || "System"}</span>,
                  <Badge key="a" variant="secondary" className="text-[10px]">{a.action?.replace(/_/g, " ") || "—"}</Badge>,
                  <span key="r" className="text-xs">{a.resource_type || a.entity_type || "—"}</span>,
                ])}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
