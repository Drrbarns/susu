"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Banknote, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payout } from "@/types";

export default function AdminPayoutsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: () => api.get<{ payouts: Payout[] }>("/payouts/history"),
  });

  const approvePayout = useMutation({
    mutationFn: (payoutId: string) => api.post("/payouts/approve", { payoutId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payouts"] }),
  });

  const markPaid = useMutation({
    mutationFn: (payoutId: string) => api.post("/payouts/mark-paid", { payoutId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payouts"] }),
  });

  const payouts = data?.payouts || [];

  const statusColors: Record<string, string> = {
    scheduled: "warning", initiated: "warning", approved: "success",
    paid: "success", failed: "destructive", cancelled: "destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
        <p className="text-muted-foreground">Manage group payouts</p>
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Group</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Turn</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-sm text-foreground">{p.groups?.name || "Group"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
                      </td>
                      <td className="p-4 font-bold text-sm">{formatCurrency(p.amount)}</td>
                      <td className="p-4 hidden md:table-cell text-sm">#{p.turn_position}</td>
                      <td className="p-4">
                        <Badge variant={statusColors[p.status] as "warning" | "success" | "destructive" || "secondary"}>{p.status}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === "initiated" && (
                            <Button size="sm" variant="gold" onClick={() => approvePayout.mutate(p.id)} loading={approvePayout.isPending}>
                              <CheckCircle2 className="h-3 w-3" /> Approve
                            </Button>
                          )}
                          {p.status === "approved" && (
                            <Button size="sm" variant="default" onClick={() => markPaid.mutate(p.id)} loading={markPaid.isPending}>
                              <Banknote className="h-3 w-3" /> Mark Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payouts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No payouts yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
