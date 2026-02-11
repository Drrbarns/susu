"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Edit2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";

export default function AdminSMSPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sms-templates"],
    queryFn: () => api.get<{ templates: Array<{ id: string; name: string; template_text: string; trigger_event: string; is_active: boolean }> }>("/sms/templates-list"),
  });

  const templates = data?.templates || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SMS Management</h1>
          <p className="text-muted-foreground">Manage notification templates and sending rules</p>
        </div>
        <Button variant="gold" size="sm"><Send className="h-4 w-4" /> Send Broadcast</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{templates.length}</p>
            <p className="text-xs text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{templates.filter((t) => t.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{templates.filter((t) => !t.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gold-500" />
            SMS Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
          ) : templates.length > 0 ? (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm text-foreground">{t.name}</h3>
                      <Badge variant={t.is_active ? "success" : "secondary"}>{t.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <Button variant="ghost" size="sm"><Edit2 className="h-3 w-3" /></Button>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded p-2">{t.template_text}</p>
                  <p className="text-xs text-muted-foreground mt-2">Trigger: <span className="font-medium">{t.trigger_event}</span></p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No SMS templates configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
