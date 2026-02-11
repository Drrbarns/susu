"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, UserCheck, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-members", search],
    queryFn: () => api.get<{ members: Array<{ id: string; full_name: string; phone: string; email?: string; role: string; status: string; created_at: string; kyc_status?: string }> }>("/admin/members-list", search ? { search } : undefined),
  });

  const members = data?.members || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Members</h1>
        <p className="text-muted-foreground">Manage all platform users</p>
      </div>

      <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} />

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/users/${m.id}`}>
                      <td className="p-4">
                        <Link href={`/admin/users/${m.id}`} className="flex items-center gap-3">
                          <Avatar name={m.full_name} size="sm" />
                          <div>
                            <p className="font-medium text-sm text-foreground">{m.full_name}</p>
                            {m.email && <p className="text-xs text-muted-foreground">{m.email}</p>}
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{m.phone}</td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">{formatDate(m.created_at)}</td>
                      <td className="p-4"><Badge variant="secondary">{m.role}</Badge></td>
                      <td className="p-4">
                        <Badge variant={m.status === "active" ? "success" : m.status === "suspended" ? "destructive" : "warning"}>
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No members found</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
