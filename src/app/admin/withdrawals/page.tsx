"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { WithdrawalRequest } from "@/types";
import { useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/use-wallet";
import { useToast } from "@/components/ui/toast";

export default function AdminWithdrawalsPage() {
  const toast = useToast();
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: () => api.get<{ withdrawals: WithdrawalRequest[] }>("/wallet/withdraw-list"),
  });

  const withdrawals = data?.withdrawals || [];

  const handleApprove = async (id: string) => {
    try {
      await approve.mutateAsync(id);
      toast.success("Approved", "Withdrawal request approved successfully");
    } catch (error: any) {
      toast.error("Error", error.message || "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject.mutateAsync(id);
      toast.success("Rejected", "Withdrawal request rejected");
    } catch (error: any) {
      toast.error("Error", error.message || "Failed to reject");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Withdrawals</h1>
        <p className="text-muted-foreground">Review and approve withdrawal requests</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Method</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">MoMo #</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-sm text-foreground">{w.user_id.slice(0, 8)}...</p>
                        <p className="text-xs text-muted-foreground">{formatDate(w.requested_at)}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm">{formatCurrency(w.amount)}</p>
                        {w.fee > 0 && <p className="text-xs text-muted-foreground">Fee: {formatCurrency(w.fee)}</p>}
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm uppercase">{w.withdrawal_method}</td>
                      <td className="p-4 hidden md:table-cell text-sm">{w.momo_number || "-"}</td>
                      <td className="p-4">
                        <Badge variant={w.status === "completed" ? "success" : w.status === "rejected" || w.status === "failed" ? "destructive" : "warning"}>
                          {w.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        {w.status === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="gold" 
                              onClick={() => handleApprove(w.id)}
                              loading={approve.isPending}
                              disabled={reject.isPending}
                            >
                              <CheckCircle2 className="h-3 w-3" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleReject(w.id)}
                              loading={reject.isPending}
                              disabled={approve.isPending}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {withdrawals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No withdrawal requests</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
