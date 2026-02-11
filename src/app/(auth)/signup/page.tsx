"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Phone, Mail, Lock, Eye, EyeOff, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";

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
  const [step, setStep] = useState<"form" | "terms">("form");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Full name is required";
    if (!form.phone.trim()) return "Phone number is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === "form") {
      const validation = validateForm();
      if (validation) {
        setError(validation);
        return;
      }
      setStep("terms");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

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
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400">Join thousands saving with Juli Smart Susu</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === "form" ? (
            <>
              <Input
                label="Full Name"
                placeholder="Kofi Mensah"
                value={form.name}
                onChange={handleChange("name")}
                icon={<User className="h-4 w-4" />}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="0241234567"
                value={form.phone}
                onChange={handleChange("phone")}
                icon={<Phone className="h-4 w-4" />}
                required
              />
              <Input
                label="Email (optional)"
                type="email"
                placeholder="kofi@example.com"
                value={form.email}
                onChange={handleChange("email")}
                icon={<Mail className="h-4 w-4" />}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange("password")}
                  icon={<Lock className="h-4 w-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                icon={<Lock className="h-4 w-4" />}
                required
              />
              <Input
                label="Referral Code (optional)"
                placeholder="Enter referral code"
                value={form.referralCode}
                onChange={handleChange("referralCode")}
                icon={<Gift className="h-4 w-4" />}
              />
              <Button type="submit" className="w-full" variant="gold" size="lg">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-navy-50 dark:bg-navy-700/50 p-4 rounded-lg text-sm space-y-3">
                <h3 className="font-semibold text-navy-900 dark:text-white">Terms & Conditions</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>- I agree to make daily contributions on time</li>
                  <li>- I understand late payments may incur fees</li>
                  <li>- I agree to the Juli Smart Susu <Link href="/terms" className="text-gold-600 underline">Terms of Service</Link></li>
                  <li>- I have read the <Link href="/privacy" className="text-gold-600 underline">Privacy Policy</Link></li>
                </ul>
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded border-gray-300 text-gold-500 focus:ring-gold-500 h-4 w-4"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">I agree to all terms and conditions</span>
              </label>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("form")}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" variant="gold" loading={loading}>
                  Create Account
                </Button>
              </div>
            </motion.div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-gold-600 hover:text-gold-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
