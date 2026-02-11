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
      {/* ── HERO (UNCHANGED) ── */}
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
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            {[
              { value: "15,000+", label: "Active Savers" },
              { value: "GHS 25M+", label: "Total Saved" },
              { value: "99.9%", label: "Payout Rate" },
              { value: "4.9/5", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label} className="px-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IS SUSU ── */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-900 mb-6">
                <span className="w-2 h-2 rounded-full bg-gold-500" />
                About Juli Susu
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                The age-old Susu tradition, <br className="hidden sm:block" />built for the modern world.
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                For generations, Ghanaians have saved together through Susu — a community savings system built on trust. Juli Smart Susu digitizes this tradition, adding security, transparency, and convenience without losing the communal spirit.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Whether you&apos;re a market trader, a young professional, or saving for something big, Juli gives you a safe, simple way to grow your money with people you trust.
              </p>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-gold-600 transition-colors group">
                Learn how it works <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Stats card cluster */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-gray-900" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">GHS 25M+</div>
                <div className="text-sm text-gray-500">Saved on the platform</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gray-900" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">15K+</div>
                <div className="text-sm text-gray-500">Active savers</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-gray-900" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">99.9%</div>
                <div className="text-sm text-gray-500">Payout success rate</div>
              </div>
              <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-gold-400 fill-gold-400" />
                </div>
                <div className="text-2xl font-bold mb-1">4.9/5</div>
                <div className="text-sm text-gray-400">Average rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to save smarter
            </h2>
            <p className="text-lg text-gray-600">
              We took the Susu you trust and added the security, speed, and transparency you deserve.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="h-6 w-6 text-gray-900" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Start saving in under 2 minutes
            </h2>
            <p className="text-lg text-gray-600">
              No paperwork. No bank queues. Just your phone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-10" />
            
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center bg-stone-50"
              >
                <div className="w-24 h-24 rounded-full bg-white border-4 border-stone-50 flex items-center justify-center mx-auto mb-6 shadow-sm relative z-10">
                  <s.icon className="h-8 w-8 text-gray-900" />
                </div>
                <div className="text-xs font-bold text-gold-600 mb-2 tracking-widest uppercase">Step {s.num}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed px-4">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/signup">
              <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-black/5">
                Get Started Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                See how fast your savings grow
              </h2>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xl shadow-gray-200/50">
              <div className="grid md:grid-cols-2">
                <div className="p-8 sm:p-12 bg-white">
                  <div className="space-y-10">
                    <div>
                      <div className="flex justify-between items-baseline mb-4">
                        <label className="text-sm font-semibold text-gray-900">Daily Contribution</label>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(calcAmount)}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="200"
                        step="5"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                        <span>GHS 5</span>
                        <span>GHS 200</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline mb-4">
                        <label className="text-sm font-semibold text-gray-900">Duration</label>
                        <span className="text-xl font-bold text-gray-900">{calcDays} Days</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={calcDays}
                        onChange={(e) => setCalcDays(Number(e.target.value))}
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                        <span>10 days</span>
                        <span>100 days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 sm:p-12 bg-gray-50 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100">
                  <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Your Total Payout</div>
                  <div className="text-5xl font-bold text-gray-900 mb-2">{formatCurrency(calcAmount * calcDays)}</div>
                  <div className="text-sm text-gray-500 mb-8">
                    Based on {calcDays} daily contributions of {formatCurrency(calcAmount)}
                  </div>
                  
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-black text-white hover:bg-gray-800 h-14 text-lg font-bold rounded-xl shadow-lg shadow-black/10">
                      Start Saving This Amount
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    *Payouts are guaranteed and automated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by savers across Ghana
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 text-gold-500 fill-gold-500" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-8 font-medium">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center text-sm font-bold border border-white shadow-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            Ready to start saving?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of Ghanaians already building their financial future with Juli Smart Susu. It&apos;s free, safe, and takes less than a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-8 h-14 text-lg font-bold w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-900 hover:text-white rounded-full px-8 h-14 text-lg font-medium w-full sm:w-auto">
                Talk to Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
