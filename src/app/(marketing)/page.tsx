"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, Users, Wallet, TrendingUp, ChevronRight,
  Smartphone, Clock, CheckCircle2, Star,
  ArrowRight, Calculator, Lock, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const features = [
  { icon: Shield, title: "Bank-Grade Security", description: "Your funds are safeguarded with top-tier encryption and transparent smart contracts." },
  { icon: Users, title: "Trusted Community", description: "Join verified circles or start your own with friends and family you trust." },
  { icon: Wallet, title: "Seamless MoMo", description: "Instant deposits and payouts via MTN, Vodafone, and AirtelTigo Mobile Money." },
  { icon: TrendingUp, title: "Guaranteed Payouts", description: "Automated rotation ensures everyone gets paid on time, every time." },
  { icon: Smartphone, title: "Real-Time Tracking", description: "Monitor your contributions and group progress instantly from your dashboard." },
  { icon: Clock, title: "Flexible Schedules", description: "Choose daily, weekly, or monthly plans that align with your income flow." },
];

const steps = [
  { step: "01", title: "Sign Up Instantly", description: "Create your free account with just your phone number." },
  { step: "02", title: "Join a Circle", description: "Find a public group or create a private one for your squad." },
  { step: "03", title: "Contribute", description: "Make easy payments via Mobile Money." },
  { step: "04", title: "Get Paid", description: "Receive your lump sum directly to your wallet when it's your turn." },
];

const testimonials = [
  { name: "Ama Serwaa", role: "Trader, Accra", text: "I used to keep my savings under my mattress. Juli Susu helped me save GHS 5,000 to expand my shop safely.", rating: 5 },
  { name: "Kwame Boateng", role: "Driver, Kumasi", text: "The transparency is what I love. I can see exactly when I'm getting paid. No stories.", rating: 5 },
  { name: "Efua Mensah", role: "Nurse, Takoradi", text: "Paying directly from MoMo is a game changer. I don't have to wait for a collector to come around.", rating: 5 },
];

export default function HomePage() {
  const [calcAmount, setCalcAmount] = useState(20);
  const [calcDays, setCalcDays] = useState(30);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy-950 text-white min-h-[90vh] flex items-center">
        {/* Abstract Background Patterns (Adinkra-inspired shapes) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl" />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-navy-800/50 border border-gold-500/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
                <Star className="h-3.5 w-3.5 text-gold-400 fill-gold-400" />
                <span className="text-gold-100 text-xs font-semibold tracking-wide uppercase">The #1 Digital Susu Platform</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
                Modern Savings, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300">
                  Timeless Tradition.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed max-w-lg">
                Experience the trusted Ghanaian Susu system, reimagined for the digital age. Secure, transparent, and built for your prosperity.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button variant="gold" size="xl" className="w-full sm:w-auto font-bold text-navy-950 shadow-lg shadow-gold-500/20">
                    Start Saving Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto border-navy-700 hover:bg-navy-800 text-white">
                    See How It Works
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Licensed & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Instant Payouts</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 bg-gradient-to-b from-navy-800 to-navy-900 rounded-3xl p-8 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm">
                {/* Mock UI Header */}
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-navy-900 font-bold">JD</div>
                    <div>
                      <div className="text-white font-medium">John Doe</div>
                      <div className="text-xs text-gold-400">Premium Saver</div>
                    </div>
                  </div>
                  <Wallet className="h-6 w-6 text-gray-400" />
                </div>

                {/* Mock UI Balance */}
                <div className="bg-navy-950/50 rounded-2xl p-6 mb-6 border border-white/5">
                  <div className="text-sm text-gray-400 mb-1">Total Savings Balance</div>
                  <div className="text-4xl font-bold text-white mb-4">GHS 12,450.00</div>
                  <div className="flex gap-2">
                    <div className="h-1.5 flex-1 bg-gold-500 rounded-full" />
                    <div className="h-1.5 flex-1 bg-gold-500 rounded-full" />
                    <div className="h-1.5 flex-1 bg-gold-500 rounded-full" />
                    <div className="h-1.5 flex-1 bg-navy-700 rounded-full" />
                  </div>
                  <div className="text-right text-xs text-gold-400 mt-2">75% to Goal</div>
                </div>

                {/* Mock UI Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-1">Next Payout</div>
                    <div className="text-lg font-bold text-white">GHS 5,000</div>
                    <div className="text-xs text-green-400 mt-1">Due in 5 days</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-1">Group</div>
                    <div className="text-lg font-bold text-white">Makola VIP</div>
                    <div className="text-xs text-blue-400 mt-1">12 Members</div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold-500 rounded-2xl rotate-12 opacity-20 blur-xl" />
              <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-blue-600 rounded-full opacity-20 blur-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust/Stats Section */}
      <section className="bg-navy-900 border-y border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
            {[
              { label: "Active Savers", value: "15,000+" },
              { label: "Total Saved", value: "GHS 25M+" },
              { label: "Payouts Made", value: "99.9%" },
              { label: "Partner Banks", value: "5+" },
            ].map((stat) => (
              <div key={stat.label} className="px-4">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gold-400/80 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-gold-600 font-semibold tracking-wide uppercase text-sm mb-3">Why Juli Susu?</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-6">
              A Smarter Way to Save Together
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We&apos;ve taken the traditional Susu you know and trust, and added layers of security, convenience, and transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-gray-50 dark:bg-navy-900 hover:bg-white dark:hover:bg-navy-800 border border-transparent hover:border-gold-200 dark:hover:border-gold-900 shadow-sm hover:shadow-xl hover:shadow-gold-900/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gold-100 dark:bg-navy-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-gold-600" />
                </div>
                <h4 className="text-xl font-bold text-navy-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="py-24 bg-navy-50 dark:bg-navy-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-navy-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-navy-700">
            <div className="grid lg:grid-cols-2">
              <div className="p-10 lg:p-14 bg-navy-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6">Calculate Your Growth</h3>
                  <p className="text-gray-300 mb-10">See exactly how much you could receive. No hidden fees, just pure savings growth.</p>
                  
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gold-100">Daily Contribution</label>
                        <span className="font-bold text-gold-400">{formatCurrency(calcAmount)}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="200"
                        step="5"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(Number(e.target.value))}
                        className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gold-100">Duration (Days)</label>
                        <span className="font-bold text-gold-400">{calcDays} Days</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={calcDays}
                        onChange={(e) => setCalcDays(Number(e.target.value))}
                        className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                      />
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex items-end justify-between">
                      <div className="text-sm text-gray-400">Potential Payout</div>
                      <div className="text-4xl font-bold text-white">{formatCurrency(calcAmount * calcDays)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 lg:p-14 flex flex-col justify-center bg-white dark:bg-navy-800">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Lock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 dark:text-white mb-1">Guaranteed Security</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your funds are held in a secure, audited escrow account until payout.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 dark:text-white mb-1">Accessible Anywhere</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your savings from your phone, anywhere in Ghana.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                      <Star className="h-5 w-5 text-gold-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 dark:text-white mb-1">Credit Building</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Consistent savings history can help you qualify for micro-loans.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <Link href="/signup">
                    <Button variant="gold" size="lg" className="w-full font-bold shadow-lg shadow-gold-500/20">
                      Start Saving This Amount
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Steps) */}
      <section className="py-24 bg-white dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">Start Saving in Minutes</h2>
            <p className="text-gray-600 dark:text-gray-400">No complex paperwork. No bank queues.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <div key={item.step} className="relative group">
                <div className="w-16 h-16 bg-navy-50 dark:bg-navy-800 rounded-2xl flex items-center justify-center text-xl font-bold text-navy-900 dark:text-white mb-6 group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors duration-300">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                
                {/* Connector Line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-20 w-full h-px bg-gray-200 dark:bg-navy-800" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-5" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Join the Revolution</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Take control of your financial future today. Join thousands of smart savers in Ghana using Juli Susu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="gold" size="xl" className="w-full sm:w-auto font-bold px-10">
                Create Free Account
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="xl" className="w-full sm:w-auto border-navy-600 hover:bg-navy-800 text-white">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
