import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Crown, Users, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Savings Plans",
  description: "Flexible susu plans for every budget. Daily contributions starting from GHS 5.",
};

const plans = [
  {
    name: "Starter",
    daily: 5,
    members: 30,
    payout: 150,
    icon: Zap,
    description: "Perfect for students and first-time savers.",
    features: ["GHS 5 daily contribution", "30-member rotation", "GHS 150 payout", "Basic SMS reminders", "Standard support"],
    popular: false,
    color: "blue",
  },
  {
    name: "Standard",
    daily: 20,
    members: 30,
    payout: 600,
    icon: Users,
    description: "Our most popular plan for daily earners.",
    features: ["GHS 20 daily contribution", "30-member rotation", "GHS 600 payout", "SMS + App alerts", "Priority support", "Missed payment grace period"],
    popular: true,
    color: "gold",
  },
  {
    name: "Premium",
    daily: 50,
    members: 30,
    payout: 1500,
    icon: Crown,
    description: "Serious savings for business and projects.",
    features: ["GHS 50 daily contribution", "30-member rotation", "GHS 1,500 payout", "All notifications included", "VIP 24/7 support", "Early payout options", "Credit score building"],
    popular: false,
    color: "navy",
  },
];

export default function PlansPage() {
  return (
    <>
      <section className="bg-navy-950 py-24 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <Badge variant="gold" className="mb-4">Flexible Options</Badge>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">Choose Your Path to Prosperity</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Whether you're saving for school fees, business stock, or a rainy day, we have a contribution plan that fits your pocket.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative flex flex-col h-full border-2 transition-all duration-300 ${
                plan.popular 
                  ? "border-gold-500 shadow-2xl shadow-gold-500/10 z-10 scale-105 bg-white dark:bg-navy-900" 
                  : "border-transparent hover:border-gray-200 dark:hover:border-navy-700 bg-gray-50 dark:bg-navy-950"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gold-500 text-navy-950 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-lg">
                    <Star className="h-3 w-3 fill-navy-900" /> Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-2 pt-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  plan.popular ? "bg-gold-100 dark:bg-gold-900/30 text-gold-600" : "bg-white dark:bg-navy-800 text-gray-500"
                }`}>
                  <plan.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-bold text-navy-900 dark:text-white">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="text-center py-6 border-b border-gray-100 dark:border-navy-800 mb-6">
                  <div className="flex items-baseline justify-center gap-1 text-navy-900 dark:text-white">
                    <span className="text-sm font-medium text-gray-500 self-start mt-2">GHS</span>
                    <span className="text-5xl font-extrabold tracking-tight">{plan.daily}</span>
                    <span className="text-gray-500 font-medium">/day</span>
                  </div>
                  <div className="mt-4 inline-block bg-navy-50 dark:bg-navy-800 rounded-lg px-4 py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Payout: </span>
                    <span className="text-base font-bold text-gold-600">{formatCurrency(plan.payout)}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Check className={`h-5 w-5 shrink-0 ${plan.popular ? "text-gold-500" : "text-green-500"}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto">
                  <Link href="/signup" className="block">
                    <Button 
                      variant={plan.popular ? "gold" : "outline"} 
                      size="lg" 
                      className={`w-full font-bold ${plan.popular ? "shadow-lg shadow-gold-500/20" : "border-gray-300 dark:border-navy-700"}`}
                    >
                      Choose {plan.name}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 bg-navy-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Need a Custom Plan?</h3>
            <p className="text-gray-300 mb-8">
              We offer special packages for corporate groups, associations, and large families. Create a private circle with your own rules.
            </p>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Contact Sales Team
              </Button>
            </Link>
          </div>
          
          {/* Decor */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
      </section>
    </>
  );
}
