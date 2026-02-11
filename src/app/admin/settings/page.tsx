"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Settings2, DollarSign, Calculator, Clock, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";

interface SettingItem {
  key: string;
  label: string;
  placeholder: string;
  description?: string;
  suffix?: string;
}

interface SettingGroup {
  title: string;
  description: string;
  icon: React.ElementType;
  items: SettingItem[];
}

const settingGroups: SettingGroup[] = [
  {
    title: "Platform Identity",
    description: "Core branding and platform details",
    icon: Settings2,
    items: [
      { key: "company_name", label: "Platform Name", placeholder: "Juli Smart Susu", description: "Displayed across the platform" },
      { key: "support_email", label: "Support Email", placeholder: "support@julismartsusu.com" },
      { key: "support_phone", label: "Support Phone", placeholder: "+233000000000" },
      { key: "whatsapp_link", label: "WhatsApp Link", placeholder: "https://wa.me/233000000000" },
      { key: "timezone", label: "Timezone", placeholder: "Africa/Accra" },
    ],
  },
  {
    title: "Fees & Charges",
    description: "Control platform fees, withdrawal limits, and penalties",
    icon: DollarSign,
    items: [
      { key: "platform_fee_percent", label: "Platform Fee", placeholder: "2.5", suffix: "%", description: "Fee deducted from payouts" },
      { key: "withdrawal_fee_percent", label: "Withdrawal Fee", placeholder: "1", suffix: "%", description: "Fee on wallet withdrawals" },
      { key: "min_withdrawal_amount", label: "Min Withdrawal", placeholder: "10", suffix: "GHS" },
      { key: "max_withdrawal_amount", label: "Max Withdrawal", placeholder: "50000", suffix: "GHS" },
      { key: "penalty_rate_percent", label: "Late Penalty Rate", placeholder: "5", suffix: "%", description: "Penalty for missed contributions" },
      { key: "grace_period_days", label: "Grace Period", placeholder: "1", suffix: "days", description: "Days before contribution is marked late" },
    ],
  },
  {
    title: "Savings Calculator & Pricing",
    description: "Configure the homepage calculator slider ranges and pricing formula",
    icon: Calculator,
    items: [
      { key: "calc_min_daily", label: "Min Daily Contribution", placeholder: "5", suffix: "GHS", description: "Lowest amount on the slider" },
      { key: "calc_max_daily", label: "Max Daily Contribution", placeholder: "200", suffix: "GHS", description: "Highest amount on the slider" },
      { key: "calc_step_daily", label: "Daily Slider Step", placeholder: "5", suffix: "GHS", description: "Increment per slider tick" },
      { key: "calc_default_daily", label: "Default Daily Amount", placeholder: "20", suffix: "GHS", description: "Starting position of slider" },
      { key: "calc_min_days", label: "Min Duration", placeholder: "10", suffix: "days", description: "Shortest savings period" },
      { key: "calc_max_days", label: "Max Duration", placeholder: "100", suffix: "days", description: "Longest savings period" },
      { key: "calc_step_days", label: "Duration Slider Step", placeholder: "5", suffix: "days", description: "Increment per slider tick" },
      { key: "calc_default_days", label: "Default Duration", placeholder: "30", suffix: "days", description: "Starting position of slider" },
      { key: "service_fee_percent", label: "Service Fee", placeholder: "0", suffix: "%", description: "Deducted from the total payout shown to users" },
      { key: "bonus_interest_percent", label: "Bonus / Interest", placeholder: "0", suffix: "%", description: "Added on top of the total savings as a reward" },
    ],
  },
  {
    title: "SMS & Notifications",
    description: "Manage SMS provider and notification schedules",
    icon: Bell,
    items: [
      { key: "sms_enabled", label: "SMS Enabled", placeholder: "true", description: "Set to 'true' or 'false'" },
      { key: "sms_provider", label: "SMS Provider", placeholder: "moolre", description: "Active SMS provider name" },
      { key: "daily_reminder_time", label: "Daily Reminder Time", placeholder: "08:00", description: "Ghana time (HH:MM)" },
    ],
  },
];

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.get<{ settings: Record<string, Record<string, string>>; raw: Array<{ key: string; value: string; category: string }> }>("/admin/settings-get"),
  });

  const updateSettings = useMutation({
    mutationFn: (settings: Array<{ key: string; value: string }>) =>
      api.post("/admin/settings-update", { settings }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // Flatten raw settings into a lookup
  const flatSettings: Record<string, string> = {};
  if (data?.raw) {
    for (const s of data.raw) {
      flatSettings[s.key] = String(s.value);
    }
  } else if (data?.settings) {
    for (const cat of Object.values(data.settings)) {
      for (const [k, v] of Object.entries(cat)) {
        flatSettings[k] = String(v);
      }
    }
  }

  const merged = { ...flatSettings, ...form };
  const hasChanges = Object.keys(form).length > 0;

  const handleSave = async () => {
    const settingsArray = Object.entries(form).map(([key, value]) => ({ key, value }));
    if (settingsArray.length === 0) return;
    await updateSettings.mutateAsync(settingsArray);
    setForm({});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground">Configure how your platform operates, charges fees, and displays pricing</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium animate-in fade-in">Settings saved!</span>
          )}
          <Button
            variant="gold"
            onClick={handleSave}
            loading={updateSettings.isPending}
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-60" />)}</div>
      ) : (
        settingGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center">
                  <group.icon className="h-5 w-5 text-navy-600 dark:text-navy-400" />
                </div>
                <div>
                  <CardTitle className="text-base">{group.title}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {group.items.map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      {item.label}
                      {item.suffix && (
                        <span className="text-[10px] font-normal bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {item.suffix}
                        </span>
                      )}
                    </label>
                    <input
                      className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors"
                      placeholder={item.placeholder}
                      value={merged[item.key] || ""}
                      onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
                    />
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Live Preview for Calculator group */}
              {group.title === "Savings Calculator & Pricing" && (
                <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-gold-600" />
                    <span className="text-sm font-semibold text-foreground">Live Formula Preview</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {(() => {
                      const daily = Number(merged.calc_default_daily) || 20;
                      const days = Number(merged.calc_default_days) || 30;
                      const fee = Number(merged.service_fee_percent) || 0;
                      const bonus = Number(merged.bonus_interest_percent) || 0;
                      const gross = daily * days;
                      const feeAmount = gross * (fee / 100);
                      const bonusAmount = gross * (bonus / 100);
                      const net = gross - feeAmount + bonusAmount;
                      return (
                        <>
                          <p>Example: GHS {daily}/day x {days} days = <strong className="text-foreground">GHS {gross.toFixed(2)}</strong> (gross)</p>
                          {fee > 0 && <p>Service Fee: -{fee}% = <span className="text-red-500">-GHS {feeAmount.toFixed(2)}</span></p>}
                          {bonus > 0 && <p>Bonus Interest: +{bonus}% = <span className="text-green-600">+GHS {bonusAmount.toFixed(2)}</span></p>}
                          <p className="font-bold text-foreground pt-1 border-t border-border mt-2">
                            Net Payout: GHS {net.toFixed(2)}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
