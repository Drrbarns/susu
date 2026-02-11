"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/app/dashboard";

  const { login } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedPhone = normalizePhone(phone);
      const user = await login(normalizedPhone, password);

      if (user.role === "admin" || user.role === "super_admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(redirect);
      }
    } catch (err: unknown) {
      const error = err as { error?: string };
      setError(error.error || "Invalid phone number or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
          Welcome back
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Sign in to your account to continue saving
        </p>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">Phone Number</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                placeholder="0241234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-navy-900">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-gold-600 hover:text-gold-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-12 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="rounded border-gray-300 text-gold-500 focus:ring-gold-500 h-4 w-4"
          />
          <label htmlFor="remember" className="text-sm text-gray-500 select-none">
            Keep me signed in
          </label>
        </div>

        {/* Submit */}
        <Button type="submit" variant="gold" size="lg" className="w-full h-12 rounded-xl text-sm font-semibold" loading={loading}>
          Sign In
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-50 px-3 text-xs text-gray-400 uppercase tracking-wider">New here?</span>
        </div>
      </div>

      {/* Sign up link */}
      <Link href="/signup">
        <button className="w-full h-12 rounded-xl border-2 border-navy-900 text-navy-900 text-sm font-semibold hover:bg-navy-900 hover:text-white transition-all duration-200">
          Create an Account
        </button>
      </Link>

      {/* Trust badges (mobile) */}
      <div className="mt-8 flex items-center justify-center gap-6 lg:hidden">
        <div className="text-center">
          <div className="text-sm font-bold text-navy-950">15K+</div>
          <div className="text-[10px] text-gray-400 uppercase">Savers</div>
        </div>
        <div className="w-px h-6 bg-gray-200" />
        <div className="text-center">
          <div className="text-sm font-bold text-navy-950">99.9%</div>
          <div className="text-[10px] text-gray-400 uppercase">Payout Rate</div>
        </div>
        <div className="w-px h-6 bg-gray-200" />
        <div className="text-center">
          <div className="text-sm font-bold text-navy-950">4.9/5</div>
          <div className="text-[10px] text-gray-400 uppercase">Rating</div>
        </div>
      </div>
    </motion.div>
  );
}
