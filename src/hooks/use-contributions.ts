"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ContributionSchedule, Contribution } from "@/types";

interface DueContributionsResponse {
  contributions: ContributionSchedule[];
  due_today: ContributionSchedule[];
  overdue: ContributionSchedule[];
  total_due_today: number;
  total_overdue: number;
  total_due: number;
  count: number;
  count_today: number;
  count_overdue: number;
}

export function useDueContributions() {
  return useQuery({
    queryKey: ["contributions-due"],
    queryFn: () => api.get<DueContributionsResponse>("/contributions/due-today"),
    select: (data) => data.contributions,
  });
}

/** Returns full breakdown: today's dues, overdue, totals */
export function useDueBreakdown() {
  return useQuery({
    queryKey: ["contributions-due"],
    queryFn: () => api.get<DueContributionsResponse>("/contributions/due-today"),
  });
}

export function useContributionHistory() {
  return useQuery({
    queryKey: ["contribution-history"],
    queryFn: () => api.get<{ contributions: Contribution[] }>("/contributions/history"),
    select: (data) => data.contributions,
  });
}

export function useContributionStreak() {
  return useQuery({
    queryKey: ["contribution-streak"],
    queryFn: () => api.get<{ streak: number; longestStreak: number }>("/contributions/streak"),
  });
}

export function useContributionArrears() {
  return useQuery({
    queryKey: ["contribution-arrears"],
    queryFn: () => api.get<{ arrears: ContributionSchedule[] }>("/contributions/arrears"),
    select: (data) => data.arrears,
  });
}

export function useMarkContributionPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { scheduleId: string; paymentMethod: string }) =>
      api.post("/contributions/mark-paid", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contributions-due"] });
      qc.invalidateQueries({ queryKey: ["contribution-history"] });
      qc.invalidateQueries({ queryKey: ["contribution-streak"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}
