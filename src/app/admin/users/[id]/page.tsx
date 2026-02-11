"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Wallet,
  Users,
  FileText,
  Shield,
  Phone,
  Mail,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils";

interface UserDetail {
  user: {
    id: string;
    phone: string;
    email?: string;
    full_name: string;
    profile_photo_url?: string;
    role: string;
    status: string;
    momo_number?: string;
    is_phone_verified: boolean;
    is_email_verified: boolean;
    referral_code?: string;
    last_login_at?: string;
    created_at: string;
  };
  wallet: {
    id?: string;
    balance: number;
    total_deposited: number;
    total_withdrawn: number;
    total_contributed: number;
    total_received: number;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    status: string;
    description?: string;
    reference?: string;
    created_at: string;
  }>;
  memberships: Array<{
    id: string;
    role: string;
    status: string;
    position?: number;
    groups: {
      id: string;
      name: string;
      status: string;
      type: string;
      daily_amount: number;
      payout_amount: number;
    };
  }>;
  audit_logs: Array<{
    id: string;
    action: string;
    resource_type?: string;
    resource_id?: string;
    details?: Record<string, unknown>;
    created_at: string;
  }>;
  kyc?: {
    id: string;
    status: string;
    id_type?: string;
    id_number?: string;
    submitted_at?: string;
    verified_at?: string;
  };
  stats: {
    totalContributions: number;
    missedContributions: number;
  };
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [adjustOpen, setAdjustOpen] = useState(false);

  const { data, isLoading, error } = useQuery<UserDetail>({
    queryKey: ["admin-user-detail", id],
    queryFn: () => api.get<UserDetail>("/admin/user-detail", { user_id: id as string }),
    enabled: !!id,
  });

  const adjustMutation = useMutation({
    mutationFn: (payload: { user_id: string; amount: number; reason: string; type: string }) =>
      api.post("/admin/wallet-adjust", payload),
    onSuccess: () => {
      toast.success("Wallet Adjusted", "The wallet balance has been updated successfully.");
      setAdjustOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", id] });
    },
    onError: (err: { error?: string }) => {
      toast.error("Error", err.error || "Failed to adjust wallet");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-3" />
            <p className="text-muted-foreground">Failed to load user details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, wallet, transactions, memberships, audit_logs, kyc, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">User Details</h1>
          <p className="text-muted-foreground">360-degree view of user activity</p>
        </div>
        <Button variant="gold" size="sm" onClick={() => setAdjustOpen(true)}>
          <Wallet className="h-4 w-4 mr-1" /> Adjust Wallet
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar name={user.full_name} size="lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">{user.full_name}</h2>
                <Badge variant={user.status === "active" ? "success" : user.status === "suspended" ? "destructive" : "warning"}>
                  {user.status}
                </Badge>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {formatPhone(user.phone)}
                  {user.is_phone_verified && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                </span>
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {user.email}
                    {user.is_email_verified && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Joined {formatDate(user.created_at)}
                </span>
                {user.last_login_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Last login {formatDate(user.last_login_at, "relative")}
                  </span>
                )}
              </div>
              {user.momo_number && (
                <p className="text-xs text-muted-foreground">MoMo: {formatPhone(user.momo_number)}</p>
              )}
              {user.referral_code && (
                <p className="text-xs text-muted-foreground">Referral code: <span className="font-mono font-medium text-foreground">{user.referral_code}</span></p>
              )}
            </div>
            {/* KYC badge */}
            <div className="text-right">
              {kyc ? (
                <Badge variant={kyc.status === "verified" ? "success" : kyc.status === "pending" ? "warning" : "destructive"}>
                  KYC: {kyc.status}
                </Badge>
              ) : (
                <Badge variant="secondary">KYC: Not submitted</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Balance"
          value={formatCurrency(wallet.balance)}
          icon={<Wallet className="h-5 w-5 text-navy-600" />}
        />
        <StatCard
          label="Total Deposited"
          value={formatCurrency(wallet.total_deposited)}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          label="Total Withdrawn"
          value={formatCurrency(wallet.total_withdrawn)}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          label="Contributions"
          value={`${stats.totalContributions} paid`}
          sub={stats.missedContributions > 0 ? `${stats.missedContributions} missed` : undefined}
          icon={<FileText className="h-5 w-5 text-gold-500" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
          <TabsTrigger value="groups">Groups ({memberships.length})</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs ({audit_logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Balance</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Description</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 && (
                      <tr><td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">No transactions yet</td></tr>
                    )}
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/20 text-sm">
                        <td className="p-3 text-muted-foreground">{formatDate(tx.created_at)}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs">{tx.type}</Badge>
                        </td>
                        <td className={`p-3 text-right font-medium ${tx.type === "deposit" ? "text-green-600" : "text-red-500"}`}>
                          {tx.type === "deposit" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </td>
                        <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">
                          {formatCurrency(tx.balance_after)}
                        </td>
                        <td className="p-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">
                          {tx.description || tx.reference || "—"}
                        </td>
                        <td className="p-3">
                          <Badge variant={tx.status === "completed" ? "success" : tx.status === "pending" ? "warning" : "destructive"} className="text-xs">
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Group</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Role</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Daily</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Payout</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.length === 0 && (
                      <tr><td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">Not a member of any groups</td></tr>
                    )}
                    {memberships.map((m) => (
                      <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 text-sm">
                        <td className="p-3 font-medium">{m.groups?.name || "Unknown"}</td>
                        <td className="p-3 hidden sm:table-cell">
                          <Badge variant="secondary" className="text-xs">{m.groups?.type}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={m.role === "admin" ? "default" : "secondary"} className="text-xs">{m.role}</Badge>
                        </td>
                        <td className="p-3 text-right text-muted-foreground hidden md:table-cell">
                          {m.groups?.daily_amount ? formatCurrency(m.groups.daily_amount) : "—"}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {m.groups?.payout_amount ? formatCurrency(m.groups.payout_amount) : "—"}
                        </td>
                        <td className="p-3">
                          <Badge variant={m.status === "active" ? "success" : "warning"} className="text-xs">{m.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Action</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Resource</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit_logs.length === 0 && (
                      <tr><td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">No audit logs</td></tr>
                    )}
                    {audit_logs.map((log) => (
                      <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20 text-sm">
                        <td className="p-3 text-muted-foreground">{formatDate(log.created_at)}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs">{log.action.replace(/_/g, " ")}</Badge>
                        </td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">
                          {log.resource_type || "—"}
                        </td>
                        <td className="p-3 hidden md:table-cell text-xs text-muted-foreground truncate max-w-[250px]">
                          {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wallet Adjust Dialog */}
      <AdjustWalletDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        userId={user.id}
        userName={user.full_name}
        currentBalance={wallet.balance}
        isPending={adjustMutation.isPending}
        onSubmit={(payload) => adjustMutation.mutate(payload)}
      />
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          {icon}
        </div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-red-500 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function AdjustWalletDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentBalance,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentBalance: number;
  isPending: boolean;
  onSubmit: (payload: { user_id: string; amount: number; reason: string; type: string }) => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("correction");
  const [direction, setDirection] = useState<"credit" | "debit">("credit");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    onSubmit({
      user_id: userId,
      amount: direction === "credit" ? numAmount : -numAmount,
      reason,
      type,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Wallet</DialogTitle>
          <DialogDescription>
            Manually credit or debit {userName}&apos;s wallet. Current balance: {formatCurrency(currentBalance)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={direction === "credit" ? "gold" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setDirection("credit")}
            >
              <Plus className="h-4 w-4 mr-1" /> Credit
            </Button>
            <Button
              type="button"
              variant={direction === "debit" ? "destructive" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setDirection("debit")}
            >
              <Minus className="h-4 w-4 mr-1" /> Debit
            </Button>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Amount (GHS)</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="correction">Correction</option>
              <option value="bonus">Bonus</option>
              <option value="fee">Fee</option>
              <option value="refund">Refund</option>
              <option value="penalty">Penalty</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Reason</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the reason for this adjustment"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={direction === "credit" ? "gold" : "destructive"}
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Processing...</>
              ) : (
                <>{direction === "credit" ? "Credit" : "Debit"} Wallet</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
