"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDueContributions,
  useContributionArrears,
} from "@/hooks/use-contributions";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api-client";
import type { ContributionSchedule } from "@/types";

interface PaymentIntentResult {
  checkout_url?: string;
  instructions?: string;
  status?: string;
  id?: string;
}

export default function PayPage() {
  const searchParams = useSearchParams();
  const { data: dueContributions, isLoading: dueLoading } = useDueContributions();
  const { data: arrears } = useContributionArrears();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const toast = useToast();

  // Handle redirect from Moolre payment
  useEffect(() => {
    const paymentSuccess = searchParams.get("payment_success");
    const intentId = searchParams.get("intent");
    if (paymentSuccess === "true" && intentId) {
      toast.success("Payment Processing", "Your payment is being confirmed. You will be notified shortly.");
      api
        .post<{ status?: string }>("/payments/verify", {
          payment_intent_id: intentId,
          fromRedirect: true,
        })
        .then((res) => {
          if (res.status === "completed") {
            toast.success("Payment Confirmed", "Your contribution payment was successful!");
          }
        })
        .catch(() => {
          // Payment will be confirmed via webhook
        });
    }
  }, [searchParams, toast]);

  const handlePay = async (contribution: ContributionSchedule) => {
    setPayingId(contribution.id);
    try {
      const result = await api.post<PaymentIntentResult>("/payments/create-intent", {
        amount: contribution.total_amount || contribution.amount,
        payment_method: "momo",
        purpose: "contribution",
        group_id: contribution.group_id,
        contribution_schedule_id: contribution.id,
      });

      if (result.checkout_url) {
        toast.info("Redirecting to payment...", "You will be redirected to complete your MoMo payment.");
        setTimeout(() => {
          window.location.href = result.checkout_url!;
        }, 1000);
      } else {
        toast.info("Payment Initiated", result.instructions || "Please check your phone to complete payment.");
        setPaidIds((prev) => new Set([...prev, contribution.id]));
      }
    } catch (err: unknown) {
      const error = err as { error?: string };
      toast.error("Payment Failed", error?.error || "Could not initiate payment. Please try again.");
    }
    setPayingId(null);
  };

  const totalDue = (dueContributions || []).reduce((sum: number, c: ContributionSchedule) => sum + (c.amount || 0), 0);
  const totalArrears = (arrears || []).reduce((sum: number, c: ContributionSchedule) => sum + (c.total_amount || c.amount || 0), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Pay Contributions</h1>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Card className="bg-gradient-to-br from-gold-500 to-gold-600 text-navy-900 border-none">
          <CardContent className="p-3 sm:p-4">
            <CircleDollarSign className="h-5 w-5 mb-1 sm:mb-2" />
            <p className="text-[10px] sm:text-xs opacity-80">Due Today</p>
            <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalDue)}</p>
          </CardContent>
        </Card>
        <Card
          className={
            totalArrears > 0
              ? "bg-gradient-to-br from-red-500 to-red-600 text-white border-none"
              : ""
          }
        >
          <CardContent className="p-3 sm:p-4">
            <AlertCircle className="h-5 w-5 mb-1 sm:mb-2" />
            <p className="text-[10px] sm:text-xs opacity-80">Arrears</p>
            <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalArrears)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-gold-500" /> Due Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dueLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : dueContributions && dueContributions.length > 0 ? (
            <div className="space-y-3">
              {dueContributions.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border/50 gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">
                      {c.groups?.name || c.group_name || "Group"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.status === "overdue" ? "Overdue" : "Due today"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <p className="font-bold text-sm text-foreground">
                      {formatCurrency(c.total_amount || c.amount)}
                    </p>
                    <AnimatePresence mode="wait">
                      {paidIds.has(c.id) ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </motion.div>
                      ) : (
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => handlePay(c)}
                          disabled={payingId === c.id}
                        >
                          {payingId === c.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Smartphone className="h-3 w-3" />
                          )}
                          {payingId === c.id ? "..." : "Pay"}
                        </Button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-50" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">No contributions due today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {arrears && arrears.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" /> Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {arrears.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {c.groups?.name || c.group_name || "Group"}
                    </p>
                    <p className="text-xs text-destructive">Due: {c.due_date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-destructive">
                      {formatCurrency(c.total_amount || c.amount)}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePay(c)}
                      disabled={payingId === c.id}
                    >
                      {payingId === c.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3 w-3" />
                      )}
                      Pay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
