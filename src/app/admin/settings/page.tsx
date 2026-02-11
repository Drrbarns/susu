"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";

const settingGroups = [
  {
    title: "Platform Settings",
    items: [
      { key: "platform_name", label: "Platform Name", placeholder: "Juli Smart Susu" },
      { key: "platform_currency", label: "Currency", placeholder: "GHS" },
      { key: "min_contribution", label: "Min Contribution", placeholder: "5" },
      { key: "max_contribution", label: "Max Contribution", placeholder: "100" },
    ],
  },
  {
    title: "Fee Settings",
    items: [
      { key: "platform_fee_percent", label: "Platform Fee (%)", placeholder: "2" },
      { key: "withdrawal_fee_percent", label: "Withdrawal Fee (%)", placeholder: "1" },
      { key: "late_fee_percent", label: "Late Fee (%)", placeholder: "10" },
    ],
  },
];

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.get<{ settings: Record<string, string> }>("/admin/settings-get"),
  });
  const updateSettings = useMutation({
    mutationFn: (s: Record<string, string>) => api.post("/admin/settings-update", { settings: s }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const settings = { ...data?.settings, ...form };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure platform settings</p>
        </div>
        <Button variant="gold" onClick={() => updateSettings.mutate(form)} loading={updateSettings.isPending}>
          <Save className="h-4 w-4" /> Save
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-60" />)}</div>
      ) : (
        settingGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader><CardTitle className="text-base">{group.title}</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {group.items.map((item) => (
                <Input key={item.key} label={item.label} placeholder={item.placeholder} value={settings[item.key] || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [item.key]: e.target.value })} />
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
