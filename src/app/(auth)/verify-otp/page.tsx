"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, RotateCcw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const { verifyOTP, resendOTP } = useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all digits filled
    if (value && index === 5) {
      const code = [...newOtp.slice(0, 5), value.slice(-1)].join("");
      if (code.length === 6) {
        handleVerify(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    text.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) {
      handleVerify(text);
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 6) { setError("Please enter the full 6-digit code"); return; }
    setError("");
    setLoading(true);
    try {
      await verifyOTP(phone, code);
      router.push("/app/dashboard");
    } catch (err: unknown) {
      const error = err as { error?: string };
      setError(error.error || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(otp.join(""));
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendOTP(phone);
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code. Try again later.");
    }
  };

  // Format phone for display
  const maskedPhone = phone
    ? phone.slice(0, 3) + "****" + phone.slice(-3)
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gold-50 flex items-center justify-center mx-auto mb-5">
          <Smartphone className="h-8 w-8 text-gold-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
          Verify your phone
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-navy-900">{maskedPhone || phone}</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* OTP Inputs */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 bg-white text-navy-950 outline-none transition-all duration-200 ${
                digit
                  ? "border-gold-500 ring-2 ring-gold-500/20"
                  : "border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              }`}
            />
          ))}
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full h-12 rounded-xl text-sm font-semibold" loading={loading}>
          Verify & Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* Resend */}
      <div className="mt-8 text-center space-y-3">
        <p className="text-xs text-gray-400">Didn&apos;t receive the code?</p>
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-sm font-medium text-gold-600 hover:text-gold-700 disabled:text-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>

      {/* Security note */}
      <div className="mt-8 flex items-center gap-2 justify-center text-[11px] text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Your code expires in 10 minutes
      </div>
    </motion.div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center animate-pulse">
            <span className="text-navy-900 font-bold text-xs">JS</span>
          </div>
        </div>
      }
    >
      <OTPForm />
    </Suspense>
  );
}
