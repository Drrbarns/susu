"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowLeft, ArrowRight, Lock, ShieldCheck, AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, resetPassword } = useAuthStore();

  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(normalizePhone(phone));
      setStep("otp");
    } catch (err: unknown) {
      const error = err as { error?: string };
      setError(error.error || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      await resetPassword(normalizePhone(phone), otp, newPassword);
      setStep("done");
    } catch (err: unknown) {
      const error = err as { error?: string };
      setError(error.error || "Failed to reset password");
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
      <AnimatePresence mode="wait">
        {/* ─── SUCCESS STATE ─── */}
        {step === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-navy-950 mb-2">Password Reset!</h2>
            <p className="text-gray-500 text-sm mb-8">
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
            <Link href="/login">
              <Button variant="gold" size="lg" className="w-full h-12 rounded-xl text-sm font-semibold">
                Sign in with new password
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div key="form">
            {/* Header */}
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center mb-5">
                <KeyRound className="h-6 w-6 text-navy-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
                {step === "phone" ? "Forgot password?" : "Reset password"}
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                {step === "phone"
                  ? "No worries. Enter your phone number and we'll send you a reset code."
                  : "Enter the code we sent and your new password."}
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

            {/* Phone step */}
            {step === "phone" ? (
              <form onSubmit={handleRequestReset} className="space-y-5">
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
                      onChange={(e) => { setPhone(e.target.value); setError(""); }}
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                    />
                  </div>
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full h-12 rounded-xl text-sm font-semibold" loading={loading}>
                  Send Reset Code
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                {/* Code sent badge */}
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Code sent to {phone}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Verification Code</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value); setError(""); }}
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all tracking-widest font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">New Password</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                    />
                  </div>
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full h-12 rounded-xl text-sm font-semibold" loading={loading}>
                  Reset Password
                </Button>
              </form>
            )}

            {/* Back to sign in */}
            <div className="mt-8 text-center">
              <Link href="/login" className="text-sm text-gray-500 hover:text-gold-600 inline-flex items-center gap-1.5 font-medium">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
