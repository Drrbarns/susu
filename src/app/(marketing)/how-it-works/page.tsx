import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, UserPlus, Users, CreditCard, BadgeDollarSign, Shield, Clock, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how Juli Smart Susu group savings work. Simple steps to start saving with your community.",
};

const steps = [
  { icon: UserPlus, title: "1. Sign Up", description: "Create your account with just your phone number. Verification takes under a minute. No paperwork, no bank account needed.", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30" },
  { icon: Users, title: "2. Join a Group", description: "Browse available susu groups by size, daily amount, and duration. Pick one that fits your budget, or create your own group and invite friends.", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30" },
  { icon: CreditCard, title: "3. Contribute Daily", description: "Make your daily contribution via Mobile Money (MTN, Vodafone, or AirtelTigo). You'll get a reminder each day so you never miss a payment.", color: "bg-green-100 text-green-600 dark:bg-green-900/30" },
  { icon: BadgeDollarSign, title: "4. Receive Your Payout", description: "When your turn comes, you receive the entire pool for that cycle directly into your MoMo wallet. Every member gets a turn - it's fair and guaranteed.", color: "bg-gold-100 text-gold-700 dark:bg-gold-900/30" },
];

const faqs = [
  { q: "Is my money safe?", a: "Absolutely. All transactions are encrypted and tracked. Smart contracts ensure payouts happen automatically and on time." },
  { q: "What if someone doesn't pay?", a: "We have a grace period system with late fees. Persistent defaulters are removed and the group continues." },
  { q: "How are turns decided?", a: "Turns are assigned when you join. Admins can also reorder based on group agreement." },
  { q: "Can I be in multiple groups?", a: "Yes! Many of our members participate in 2-3 groups at different contribution levels." },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-navy-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">How Juli Smart Susu Works</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The traditional Susu system, modernized for the digital age. Simple, secure, and accessible to everyone.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-4xl mx-auto px-4">
        <div className="space-y-8">
          {steps.map((step) => (
            <Card key={step.title} className="overflow-hidden">
              <CardContent className="p-8 flex flex-col md:flex-row gap-6 items-start">
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center shrink-0`}>
                  <step.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Why Susu?</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <Shield className="h-8 w-8 text-gold-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Trustworthy</h3>
              <p className="text-sm text-muted-foreground">Built on the centuries-old Susu tradition, now with digital guarantees</p>
            </div>
            <div className="text-center">
              <Clock className="h-8 w-8 text-gold-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Disciplined Savings</h3>
              <p className="text-sm text-muted-foreground">Group accountability keeps you on track with your savings goals</p>
            </div>
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-gold-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Lump Sum Access</h3>
              <p className="text-sm text-muted-foreground">Get a large payout for business, emergencies, or investments</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6 text-gold-500" /> Common Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 bg-navy-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8">Join a group today and start building your financial future.</p>
          <Link href="/signup">
            <Button variant="gold" size="xl">Create Account <ArrowRight className="h-5 w-5" /></Button>
          </Link>
        </div>
      </section>
    </>
  );
}
