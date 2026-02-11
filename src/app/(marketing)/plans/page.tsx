import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Crown, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Plans & Pricing",
  description: "Choose a susu plan that fits your budget. From GHS 5/day to GHS 100/day.",
};

const plans = [
  {
    name: "Starter",
    daily: 5,
    members: 30,
    payout: 150,
    icon: Zap,
    features: ["GHS 5 daily contribution", "30-member group", "GHS 150 payout", "No join fee", "SMS reminders"],
    popular: false,
  },
  {
    name: "Standard",
    daily: 20,
    members: 30,
    payout: 600,
    icon: Users,
    features: ["GHS 20 daily contribution", "30-member group", "GHS 600 payout", "Grace period included", "SMS + app notifications", "Priority support"],
    popular: true,
  },
  {
    name: "Premium",
    daily: 50,
    members: 30,
    payout: 1500,
    icon: Crown,
    features: ["GHS 50 daily contribution", "30-member group", "GHS 1,500 payout", "Extended grace period", "All notifications", "Priority support", "Early payout option"],
    popular: false,
  },
];

export default function PlansPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-navy-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Different contribution levels to match your budget. All plans come with the same great features.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "border-gold-500 shadow-xl scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="gold" className="px-4 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center mx-auto mb-3">
                  <plan.icon className="h-6 w-6 text-gold-600" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">GHS {plan.daily}</span>
                  <span className="text-muted-foreground">/day</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center mb-6">
                  <div className="text-sm text-muted-foreground">Payout amount</div>
                  <div className="text-2xl font-bold text-gold-600">GHS {plan.payout.toLocaleString()}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button variant={plan.popular ? "gold" : "outline"} className="w-full">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Can&apos;t find a plan that fits? <Link href="/contact" className="text-gold-600 font-medium hover:underline">Contact us</Link> for custom group options.
          </p>
        </div>
      </section>
    </>
  );
}
