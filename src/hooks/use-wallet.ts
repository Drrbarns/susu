"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Wallet, WalletTransaction, WithdrawalRequest } from "@/types";

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: () => api.get<{ wallet: Wallet }>("/wallet/balance"),
    select: (data) => data.wallet,
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: () => api.get<{ transactions: WalletTransaction[] }>("/wallet/transactions"),
    select: (data) => data.transactions,
  });
}

export function useWithdrawals() {
  return useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => api.get<{ withdrawals: WithdrawalRequest[] }>("/wallet/withdraw-list"),
    select: (data) => data.withdrawals,
  });
}

export function useRequestWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; withdrawal_method: string; momo_number?: string }) =>
      api.post("/wallet/withdraw-request", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
}

export function useApproveWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api.post("/admin/withdraw-approve", { requestId, action: "approve" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
    },
  });
}

export function useRejectWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api.post("/admin/withdraw-approve", { requestId, action: "reject" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
    },
  });
}
