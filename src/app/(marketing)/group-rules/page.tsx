import { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Clock, Users, Shield, Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Group Rules",
  description: "Standard rules for Juli Smart Susu savings groups.",
};

const rules = [
  { icon: CheckCircle2, title: "Daily Contributions", description: "Members must contribute the agreed daily amount before the daily deadline (usually 6:00 PM). Contributions are made via Mobile Money.", color: "text-green-600" },
  { icon: Clock, title: "Grace Period", description: "Each group has a grace period (default 24 hours) for late contributions. After the grace period, a late fee applies.", color: "text-blue-600" },
  { icon: AlertTriangle, title: "Late Fees", description: "Late contributions incur a fee (typically 10% of the daily amount). This discourages late payments and rewards punctual members.", color: "text-yellow-600" },
  { icon: Users, title: "Turn Order", description: "Payout turns are assigned in order of joining. The admin may adjust the order with the group consent.", color: "text-purple-600" },
  { icon: Shield, title: "Member Conduct", description: "Members must maintain respectful communication. Sharing group details with non-members is prohibited.", color: "text-navy-600" },
  { icon: Ban, title: "Removal Policy", description: "Members who miss 3 consecutive payments without communication will be removed from the group. Remaining balance will be refunded minus any fees.", color: "text-red-600" },
];

export default function GroupRulesPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-navy-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Group Rules</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Standard rules that apply to all Juli Smart Susu groups.</p>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="grid gap-6">
          {rules.map((rule) => (
            <Card key={rule.title}>
              <CardContent className="p-6 flex gap-4">
                <rule.icon className={`h-6 w-6 shrink-0 ${rule.color}`} />
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">{rule.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{rule.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
