"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, Lock, Eye, EyeOff, Gift, ArrowRight, ArrowLeft, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";

const stepLabels = ["Your Info", "Security", "Confirm"];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: info, 1: security, 2: terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
    setError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return "Full name is required";
      if (!form.phone.trim()) return "Phone number is required";
      if (form.phone.replace(/\D/g, "").length < 10) return "Enter a valid phone number";
    }
    if (step === 1) {
      if (form.password.length < 6) return "Password must be at least 6 characters";
      if (form.password !== form.confirmPassword) return "Passwords do not match";
    }
    if (step === 2) {
      if (!agreedToTerms) return "You must agree to the terms and conditions";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }

    setError("");
    setLoading(true);

    try {
      const result = await signup({
        name: form.name,
        phone: normalizePhone(form.phone),
        email: form.email || undefined,
        password: form.password,
        referralCode: form.referralCode || undefined,
      });

      if (result.requiresOTP) {
        router.push(`/verify-otp?phone=${encodeURIComponent(normalizePhone(form.phone))}`);
      } else {
        router.push("/app/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { error?: string };
      setError(error.error || "Registration failed. Please try again.");
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
          Create your account
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Join thousands of Ghanaians saving smarter
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-navy-900 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-navy-900" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`h-px flex-1 transition-colors duration-300 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
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
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User className="h-4 w-4" /></div>
                  <input
                    type="text"
                    placeholder="Kofi Mensah"
                    value={form.name}
                    onChange={handleChange("name")}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Phone className="h-4 w-4" /></div>
                  <input
                    type="tel"
                    placeholder="0241234567"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="h-4 w-4" /></div>
                  <input
                    type="email"
                    placeholder="kofi@example.com"
                    value={form.email}
                    onChange={handleChange("email")}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

              <Button type="button" variant="gold" size="lg" className="w-full h-12 rounded-xl text-sm font-semibold mt-2" onClick={handleNext}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: Security */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="h-4 w-4" /></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange("password")}
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
                {/* Password strength hints */}
                <div className="mt-2 flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= i * 3
                          ? form.password.length >= 12
                            ? "bg-green-500"
                            : form.password.length >= 8
                            ? "bg-gold-500"
                            : "bg-orange-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {form.password.length === 0
                    ? "Use at least 6 characters"
                    : form.password.length < 6
                    ? "Too short"
                    : form.password.length < 8
                    ? "Acceptable"
                    : form.password.length < 12
                    ? "Good"
                    : "Strong"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="h-4 w-4" /></div>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                  />
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Referral Code <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Gift className="h-4 w-4" /></div>
                  <input
                    type="text"
                    placeholder="Enter referral code"
                    value={form.referralCode}
                    onChange={handleChange("referralCode")}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-navy-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-12 px-5 rounded-xl border border-gray-200 text-navy-900 text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <Button type="button" variant="gold" size="lg" className="flex-1 h-12 rounded-xl text-sm font-semibold" onClick={handleNext}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Terms & Confirm */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-navy-900">Account Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-navy-950">{form.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-navy-950">{form.phone}</span>
                  </div>
                  {form.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-navy-950">{form.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="bg-navy-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-navy-900">Terms & Conditions</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    I agree to make contributions on time
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    I understand late payments may incur fees
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    I agree to the{" "}
                    <Link href="/terms" className="text-gold-600 underline">Terms of Service</Link>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    I have read the{" "}
                    <Link href="/privacy" className="text-gold-600 underline">Privacy Policy</Link>
                  </li>
                </ul>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => { setAgreedToTerms(e.target.checked); setError(""); }}
                  className="rounded border-gray-300 text-gold-500 focus:ring-gold-500 h-4 w-4"
                />
                <span className="text-sm text-gray-600">I agree to all terms and conditions</span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-12 px-5 rounded-xl border border-gray-200 text-navy-900 text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <Button type="submit" variant="gold" size="lg" className="flex-1 h-12 rounded-xl text-sm font-semibold" loading={loading}>
                  Create Account
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Sign in link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-600 hover:text-gold-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
