"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Shield, Users, Wallet, TrendingUp, ChevronRight,
  Smartphone, Clock, CheckCircle2, Star,
  ArrowRight, Lock, Globe, Phone, Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const features = [
  { icon: Shield, title: "Bank-Grade Security", desc: "End-to-end encryption protects every cedi. Your money is always safe." },
  { icon: Users, title: "Trusted Circles", desc: "Create private groups with people you know, or join verified public ones." },
  { icon: Wallet, title: "Mobile Money", desc: "Deposit and withdraw instantly via MTN MoMo, Vodafone Cash, and AirtelTigo." },
  { icon: TrendingUp, title: "Guaranteed Payouts", desc: "Automated rotation means everyone gets paid on time. No excuses." },
  { icon: Smartphone, title: "Real-Time Dashboard", desc: "Track every contribution, see group progress, and manage your savings in one place." },
  { icon: Clock, title: "Flexible Plans", desc: "Daily, weekly, or monthly. Pick the rhythm that matches your income." },
];

const steps = [
  { num: "01", title: "Create Your Account", desc: "Sign up with your phone number in under 60 seconds.", icon: Phone },
  { num: "02", title: "Join or Start a Group", desc: "Find a savings circle or create one for your community.", icon: Users },
  { num: "03", title: "Make Contributions", desc: "Pay easily via Mobile Money on your own schedule.", icon: Banknote },
  { num: "04", title: "Receive Your Payout", desc: "Get your lump sum directly to your wallet when it's your turn.", icon: Wallet },
];

const testimonials = [
  { name: "Ama Serwaa", location: "Trader, Accra", quote: "I used to keep my savings under my mattress. Juli helped me save GHS 5,000 to expand my shop.", avatar: "AS" },
  { name: "Kwame Boateng", location: "Driver, Kumasi", quote: "The transparency is what I love. I can see exactly when I'm getting paid. No stories.", avatar: "KB" },
  { name: "Efua Mensah", location: "Nurse, Takoradi", quote: "Paying directly from MoMo is a game changer. No more waiting for a collector.", avatar: "EM" },
];

export default function HomePage() {
  const [calcAmount, setCalcAmount] = useState(20);
  const [calcDays, setCalcDays] = useState(30);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-community.jpg"
            alt="Friends saving together with Juli Smart Susu"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-navy-950/60" />
          {/* Bottom fade to white */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-navy-950 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <p className="text-gold-400 font-semibold tracking-wide uppercase text-sm mb-4">
                Ghana&apos;s #1 Digital Susu Platform
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
                Save Together. <br />
                Grow Together.
              </h1>

              <p className="text-lg text-gray-200 leading-relaxed mb-10 max-w-lg">
                The trusted Susu system you know, now digital. Join a savings circle, contribute on your schedule, and receive guaranteed payouts — all from your phone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/signup">
                  <Button variant="gold" size="xl" className="w-full sm:w-auto font-bold">
                    Start Saving Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                    How It Works
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" /> Free to join
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" /> Instant MoMo payouts
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" /> 15,000+ active savers
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="bg-white dark:bg-navy-950 border-b border-gray-100 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "15,000+", label: "Active Savers" },
              { value: "GHS 25M+", label: "Total Saved" },
              { value: "99.9%", label: "Payout Rate" },
              { value: "4.9/5", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IS SUSU ── */}
      <section className="py-20 bg-white dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold-600 font-semibold text-sm uppercase tracking-wide mb-3">About Juli Susu</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-6 leading-tight">
                The age-old Susu tradition, <br className="hidden sm:block" />built for the modern world.
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                For generations, Ghanaians have saved together through Susu — a community savings system built on trust. Juli Smart Susu digitizes this tradition, adding security, transparency, and convenience without losing the communal spirit.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Whether you&apos;re a market trader, a young professional, or saving for something big, Juli gives you a safe, simple way to grow your money with people you trust.
              </p>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-semibold transition-colors">
                Learn how it works <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Stats card cluster */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy-900 text-white rounded-2xl p-6">
                <Wallet className="h-8 w-8 text-gold-400 mb-4" />
                <div className="text-3xl font-bold mb-1">GHS 25M+</div>
                <div className="text-sm text-gray-400">Saved on the platform</div>
              </div>
              <div className="bg-gold-50 dark:bg-navy-800 rounded-2xl p-6">
                <Users className="h-8 w-8 text-gold-600 mb-4" />
                <div className="text-3xl font-bold text-navy-900 dark:text-white mb-1">15K+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Active savers</div>
              </div>
              <div className="bg-gold-50 dark:bg-navy-800 rounded-2xl p-6">
                <TrendingUp className="h-8 w-8 text-green-600 mb-4" />
                <div className="text-3xl font-bold text-navy-900 dark:text-white mb-1">99.9%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Payout success rate</div>
              </div>
              <div className="bg-navy-900 text-white rounded-2xl p-6">
                <Star className="h-8 w-8 text-gold-400 mb-4" />
                <div className="text-3xl font-bold mb-1">4.9/5</div>
                <div className="text-sm text-gray-400">Average rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-gold-600 font-semibold text-sm uppercase tracking-wide mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              Everything you need to save smarter
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We took the Susu you trust and added the security, speed, and transparency you deserve.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-navy-900 rounded-xl p-7 border border-gray-100 dark:border-navy-800 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-navy-950/50 transition-shadow duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-gold-50 dark:bg-navy-800 flex items-center justify-center mb-5">
                  <f.icon className="h-5 w-5 text-gold-600" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-gold-600 font-semibold text-sm uppercase tracking-wide mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
              Start saving in under 2 minutes
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              No paperwork. No bank queues. Just your phone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-navy-900 dark:bg-navy-800 flex items-center justify-center mx-auto mb-5">
                  <s.icon className="h-7 w-7 text-gold-400" />
                </div>
                <div className="text-xs font-bold text-gold-600 mb-2 tracking-widest">STEP {s.num}</div>
                <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/signup">
              <Button variant="gold" size="lg" className="font-bold">
                Get Started Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section className="py-20 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-gold-600 font-semibold text-sm uppercase tracking-wide mb-3">Savings Calculator</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">
                See how fast your savings grow
              </h2>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 overflow-hidden shadow-sm">
              <div className="p-8 sm:p-10">
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-baseline mb-3">
                      <label className="text-sm font-medium text-navy-900 dark:text-white">Daily Contribution</label>
                      <span className="text-lg font-bold text-gold-600">{formatCurrency(calcAmount)}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      step="5"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-navy-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>GHS 5</span>
                      <span>GHS 200</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-3">
                      <label className="text-sm font-medium text-navy-900 dark:text-white">Duration</label>
                      <span className="text-lg font-bold text-gold-600">{calcDays} Days</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={calcDays}
                      onChange={(e) => setCalcDays(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-navy-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>10 days</span>
                      <span>100 days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-navy-900 p-8 sm:p-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Your Total Payout</div>
                    <div className="text-4xl sm:text-5xl font-bold text-white">{formatCurrency(calcAmount * calcDays)}</div>
                    <div className="text-sm text-gold-400 mt-2">
                      {calcDays} contributions of {formatCurrency(calcAmount)}
                    </div>
                  </div>
                  <Link href="/signup">
                    <Button variant="gold" size="lg" className="font-bold hidden sm:flex">
                      Start Saving
                    </Button>
                  </Link>
                </div>
                <Link href="/signup" className="sm:hidden mt-4 block">
                  <Button variant="gold" size="lg" className="font-bold w-full">
                    Start Saving This Amount
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-white dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold-600 font-semibold text-sm uppercase tracking-wide mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white">
              Loved by savers across Ghana
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 dark:bg-navy-900 rounded-xl p-7 border border-gray-100 dark:border-navy-800"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 text-gold-500 fill-gold-500" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-900 dark:bg-navy-700 text-white flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to start saving?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
            Join thousands of Ghanaians already building their financial future with Juli Smart Susu. It&apos;s free, it&apos;s safe, and it takes less than a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button variant="gold" size="xl" className="w-full sm:w-auto font-bold">
                Create Free Account
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                Talk to Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
