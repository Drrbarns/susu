"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWallet, useWalletTransactions, useWithdrawals, useRequestWithdrawal } from "@/hooks/use-wallet";
import { formatCurrency, formatDate } from "@/lib/utils";

const txTypeConfig: Record<string, { icon: typeof ArrowUpRight; color: string; label: string }> = {
  deposit: { icon: ArrowDownLeft, color: "text-green-600", label: "Deposit" },
  withdrawal: { icon: ArrowUpRight, color: "text-red-600", label: "Withdrawal" },
  contribution: { icon: ArrowUpRight, color: "text-blue-600", label: "Contribution" },
  payout: { icon: ArrowDownLeft, color: "text-gold-600", label: "Payout" },
  fee: { icon: ArrowUpRight, color: "text-orange-600", label: "Fee" },
  refund: { icon: ArrowDownLeft, color: "text-purple-600", label: "Refund" },
};

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions, isLoading: txLoading } = useWalletTransactions();
  const { data: withdrawals } = useWithdrawals();
  const requestWithdrawal = useRequestWithdrawal();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", momo_number: "" });

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestWithdrawal.mutateAsync({
      amount: Number(withdrawForm.amount),
      withdrawal_method: "momo",
      momo_number: withdrawForm.momo_number,
    });
    setWithdrawOpen(false);
    setWithdrawForm({ amount: "", momo_number: "" });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Wallet</h1>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-navy-900 to-navy-800 text-white border-none overflow-hidden relative">
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-gold-400" />
              <span className="text-sm text-gray-400">Available Balance</span>
            </div>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          {walletLoading ? (
            <Skeleton className="h-10 w-40 bg-navy-700" />
          ) : (
            <p className="text-4xl font-bold text-gold-400 mb-4">{formatCurrency(wallet?.balance || 0)}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">Total In</p>
              <p className="font-semibold text-sm">{formatCurrency(wallet?.total_deposited || 0)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">Total Out</p>
              <p className="font-semibold text-sm">{formatCurrency(wallet?.total_withdrawn || 0)}</p>
            </div>
          </div>
        </CardContent>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/5 rounded-full blur-2xl" />
      </Card>

      {/* Withdraw Button */}
      <Button variant="gold" className="w-full" onClick={() => setWithdrawOpen(true)}>
        <Send className="h-4 w-4" /> Withdraw to MoMo
      </Button>

      {/* Withdraw Sheet */}
      <Sheet open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Withdraw to MoMo</SheetTitle></SheetHeader>
          <form onSubmit={handleWithdraw} className="space-y-4 mt-4">
            <Input
              label="Amount (GHS)"
              type="number"
              placeholder="100"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
              required
            />
            <Input
              label="MoMo Number"
              type="tel"
              placeholder="0241234567"
              value={withdrawForm.momo_number}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, momo_number: e.target.value })}
              required
            />
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">{formatCurrency(wallet?.balance || 0)}</span>
              </div>
            </div>
            <Button type="submit" variant="gold" className="w-full" loading={requestWithdrawal.isPending}>
              Request Withdrawal
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Transactions */}
      <Tabs defaultValue="transactions">
        <TabsList className="w-full">
          <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex-1">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-4">
              {txLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((tx) => {
                    const config = txTypeConfig[tx.type] || txTypeConfig.deposit;
                    const Icon = config.icon;
                    const isCredit = ["deposit", "payout", "refund"].includes(tx.type);
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-muted ${config.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{config.label}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.created_at, "relative")}</p>
                          </div>
                        </div>
                        <p className={`font-bold text-sm ${isCredit ? "text-green-600" : "text-foreground"}`}>
                          {isCredit ? "+" : "-"}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground text-sm">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardContent className="p-4">
              {withdrawals && withdrawals.length > 0 ? (
                <div className="space-y-2">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{formatCurrency(w.amount)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(w.requested_at, "relative")}</p>
                      </div>
                      <Badge variant={w.status === "completed" ? "success" : w.status === "rejected" ? "destructive" : "warning"}>
                        {w.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground text-sm">No withdrawal requests</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
