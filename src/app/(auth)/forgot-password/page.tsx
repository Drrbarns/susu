"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, ArrowLeft, ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, resetPassword } = useAuthStore();

  const [step, setStep] = useState<"phone" | "otp" | "reset" | "done">("phone");
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl p-8 border border-white/10">
        {step === "done" ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">Password Reset!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Your password has been changed successfully.</p>
            <Link href="/login">
              <Button variant="gold" size="lg" className="w-full">Sign in with new password</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Forgot Password</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {step === "phone"
                  ? "Enter your phone number and we'll send a reset code"
                  : "Enter the code and your new password"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {step === "phone" ? (
              <form onSubmit={handleRequestReset} className="space-y-5">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="0241234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Phone className="h-4 w-4" />}
                  required
                />
                <Button type="submit" className="w-full" variant="gold" size="lg" loading={loading}>
                  Send Reset Code <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndReset} className="space-y-5">
                <Input
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  icon={<ShieldCheck className="h-4 w-4" />}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  required
                />
                <Button type="submit" className="w-full" variant="gold" size="lg" loading={loading}>
                  Reset Password
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-gray-500 hover:text-gold-600 inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
