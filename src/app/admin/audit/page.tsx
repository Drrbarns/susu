"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { AuditLog } from "@/types";

const actionColors: Record<string, string> = {
  login: "bg-blue-100 text-blue-700",
  register: "bg-green-100 text-green-700",
  create: "bg-purple-100 text-purple-700",
  update: "bg-yellow-100 text-yellow-700",
  delete: "bg-red-100 text-red-700",
};

export default function AdminAuditPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => api.get<{ logs: AuditLog[] }>("/admin/audit-logs"),
  });

  const logs = data?.logs || [];
  const filtered = logs.filter(
    (l) => l.action.toLowerCase().includes(search.toLowerCase()) || l.resource_type?.toLowerCase().includes(search.toLowerCase()) || l.user_id.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-muted-foreground">Track all platform activity</p>
      </div>

      <Input placeholder="Search by action, resource, or user..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} />

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Resource</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">User</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => {
                    const actionType = log.action.split("_")[0] || "default";
                    const colorClass = actionColors[actionType] || "bg-gray-100 text-gray-700";
                    return (
                      <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(log.created_at, "relative")}</td>
                        <td className="p-4"><Badge className={colorClass}>{log.action}</Badge></td>
                        <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{log.resource_type ? `${log.resource_type}/${log.resource_id?.slice(0, 8)}` : "-"}</td>
                        <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground font-mono">{log.user_id.slice(0, 12)}...</td>
                        <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">{log.ip_address || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No logs found</div>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
