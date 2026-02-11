"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, Users, Wallet, TrendingUp, ChevronRight,
  Smartphone, Clock, CheckCircle2, Star,
  ArrowRight, Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const features = [
  { icon: Shield, title: "100% Secure", description: "Your savings are protected with bank-level encryption and smart contracts" },
  { icon: Users, title: "Trusted Groups", description: "Join verified groups or create your own with transparent rules" },
  { icon: Wallet, title: "Easy MoMo", description: "Pay and receive directly through Mobile Money - no bank needed" },
  { icon: TrendingUp, title: "Guaranteed Payouts", description: "Every member gets their turn. Automated, fair, and on-time payouts" },
  { icon: Smartphone, title: "Track Everything", description: "Monitor your contributions, payouts, and group activity in real-time" },
  { icon: Clock, title: "Flexible Plans", description: "Daily, weekly, or monthly contributions to match your earning rhythm" },
];

const steps = [
  { step: "01", title: "Create an Account", description: "Sign up with your phone number in under 2 minutes" },
  { step: "02", title: "Join or Create a Group", description: "Browse available groups or start your own susu circle" },
  { step: "03", title: "Make Daily Contributions", description: "Pay your daily amount via Mobile Money - quick and easy" },
  { step: "04", title: "Receive Your Payout", description: "When it's your turn, get the full pool amount directly to your MoMo" },
];

const testimonials = [
  { name: "Ama Serwaa", location: "Accra", text: "Juli Smart Susu helped me save for my shop. The system is so easy!", rating: 5 },
  { name: "Kwame Boateng", location: "Kumasi", text: "I trust this more than keeping money at home. My group is like family.", rating: 5 },
  { name: "Efua Mensah", location: "Takoradi", text: "The MoMo integration is seamless. I pay every morning before work.", rating: 5 },
];

export default function HomePage() {
  const [calcAmount, setCalcAmount] = useState(10);
  const [calcDays, setCalcDays] = useState(30);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-6">
                <Star className="h-4 w-4 text-gold-400" />
                <span className="text-gold-300 text-sm font-medium">Trusted by 10,000+ Ghanaians</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Save Together,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                  Prosper Together
                </span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                Join Ghana&apos;s most trusted digital susu platform. Daily contributions, guaranteed payouts, and a community that saves together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button variant="gold" size="xl" className="w-full sm:w-auto">
                    Start Saving Today
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                    How It Works
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-gold-400">10K+</div>
                  <div className="text-sm text-gray-400">Active Savers</div>
                </div>
                <div className="w-px h-10 bg-navy-700" />
                <div>
                  <div className="text-2xl font-bold text-gold-400">500+</div>
                  <div className="text-sm text-gray-400">Groups</div>
                </div>
                <div className="w-px h-10 bg-navy-700" />
                <div>
                  <div className="text-2xl font-bold text-gold-400">GHS 2M+</div>
                  <div className="text-sm text-gray-400">Saved</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                  <div className="bg-navy-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Total Saved</span>
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">+12.5%</span>
                    </div>
                    <div className="text-3xl font-bold text-white">GHS 4,520.00</div>
                    <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full w-3/4" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-navy-700/50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">Next Payout</div>
                        <div className="text-white font-semibold">GHS 3,000</div>
                      </div>
                      <div className="bg-navy-700/50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">Due Today</div>
                        <div className="text-gold-400 font-semibold">GHS 100</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-gold-500 text-navy-900 rounded-2xl p-4 shadow-xl">
                  <CheckCircle2 className="h-6 w-6 mb-1" />
                  <div className="text-xs font-bold">Payout Received!</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gold-500">Juli Smart Susu</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need for modern, secure group savings
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-gold-600" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start saving in 4 simple steps
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-navy-900 font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/how-it-works">
              <Button variant="outline" size="lg">
                Learn More <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 text-gold-600 mb-4">
                <Calculator className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Savings Calculator</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                See How Much You Can Save
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Adjust the daily amount and group duration to see your potential payout.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Daily Contribution: <span className="text-gold-600 font-bold">{formatCurrency(calcAmount)}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-gold-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>GHS 5</span>
                    <span>GHS 100</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Group Duration: <span className="text-gold-600 font-bold">{calcDays} days</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={calcDays}
                    onChange={(e) => setCalcDays(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-gold-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10 days</span>
                    <span>60 days</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-navy-900 to-navy-800 text-white border-none shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-sm text-gray-400 mb-2">Your Payout Amount</div>
                    <div className="text-5xl font-bold text-gold-400">
                      {formatCurrency(calcAmount * calcDays)}
                    </div>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Daily contribution</span>
                      <span className="font-medium">{formatCurrency(calcAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Group members</span>
                      <span className="font-medium">{calcDays} people</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total you contribute</span>
                      <span className="font-medium">{formatCurrency(calcAmount * calcDays)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">You receive (your turn)</span>
                      <span className="font-medium text-gold-400">{formatCurrency(calcAmount * calcDays)}</span>
                    </div>
                  </div>
                  <Link href="/signup">
                    <Button variant="gold" size="lg" className="w-full">
                      Start Saving Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What Our Savers Say</h2>
            <p className="text-muted-foreground text-lg">Real stories from real people</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-gold-500 text-gold-500" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <div>
                      <div className="font-semibold text-foreground">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.location}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Saving?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of Ghanaians who are building their financial future with Juli Smart Susu. It only takes 2 minutes to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button variant="gold" size="xl">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="outline" size="xl" className="border-white/20 text-white hover:bg-white/10">
                  View Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
