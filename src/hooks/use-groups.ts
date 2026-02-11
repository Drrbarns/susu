"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { SusuGroup } from "@/types";

export function useGroups(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["groups", params],
    queryFn: () => api.get<{ data?: SusuGroup[]; groups?: SusuGroup[] }>("/groups/list", params),
    select: (data) => data.data || data.groups || [],
  });
}

export function useGroupDetail(id: string) {
  return useQuery({
    queryKey: ["group", id],
    queryFn: () => api.get<{ data?: SusuGroup; group?: SusuGroup }>(`/groups/detail`, { groupId: id }),
    select: (data) => data.data || data.group,
    enabled: !!id,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ["group-members", groupId],
    queryFn: () => api.get<{ members: unknown[] }>("/groups/members", { group_id: groupId }),
    select: (data) => data.members,
    enabled: !!groupId,
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { groupId: string }) => api.post("/groups/join", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { groupId: string }) => api.post("/groups/leave", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/groups/create", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => api.post("/admin/group-delete", { group_id: groupId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}
