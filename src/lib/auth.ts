"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { api } from "./api-client";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (phone: string, password: string) => Promise<User>;
  signup: (data: { name: string; phone: string; email?: string; password: string; referralCode?: string }) => Promise<{ user: User; requiresOTP: boolean }>;
  logout: () => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>;
  resendOTP: (phone: string) => Promise<boolean>;
  requestPasswordReset: (phone: string) => Promise<boolean>;
  resetPassword: (phone: string, otp: string, newPassword: string) => Promise<boolean>;
  updateProfile: (data: Record<string, unknown>) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      login: async (phone, password) => {
        const data = await api.post<{ user: User; token: string }>("/auth/login", {
          phone,
          password,
          deviceInfo: getDeviceInfo(),
        });
        set({ user: data.user });
        return data.user;
      },

      signup: async (signupData) => {
        const data = await api.post<{ user: User; token: string; requiresOTP: boolean }>(
          "/auth/register",
          signupData
        );
        set({ user: data.user });
        return { user: data.user, requiresOTP: data.requiresOTP };
      },

      logout: async () => {
        await api.post("/auth/logout").catch(() => {});
        set({ user: null });
      },

      verifyOTP: async (phone, otp) => {
        const data = await api.post<{ success: boolean }>("/auth/verify-otp", { phone, otp });
        return data.success;
      },

      resendOTP: async (phone) => {
        const data = await api.post<{ success: boolean }>("/auth/resend-otp", { phone });
        return data.success;
      },

      requestPasswordReset: async (phone) => {
        const data = await api.post<{ success: boolean }>("/auth/reset-password", { phone });
        return data.success;
      },

      resetPassword: async (phone, otp, newPassword) => {
        const data = await api.post<{ success: boolean }>("/auth/reset-password", {
          phone,
          otp,
          newPassword,
        });
        return data.success;
      },

      updateProfile: async (profileData) => {
        const data = await api.post<{ user: User }>("/auth/update-profile", {
          profileData,
        });
        set({ user: data.user });
        return data.user;
      },

      changePassword: async (currentPassword, newPassword) => {
        const data = await api.post<{ success: boolean }>("/auth/change-password", {
          currentPassword,
          newPassword,
        });
        return data.success;
      },

      refreshUser: async () => {
        try {
          const data = await api.get<{ user: User }>("/auth/me");
          set({ user: data.user, loading: false });
        } catch {
          set({ user: null, loading: false });
        }
      },
    }),
    {
      name: "juli-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

function getDeviceInfo() {
  if (typeof window === "undefined") return {};
  const ua = navigator.userAgent;
  return {
    deviceId: getOrCreateDeviceId(),
    deviceName: ua,
    deviceType: /Mobile|Android|iPhone/.test(ua) ? "mobile" : "desktop",
    browser: ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : "Unknown",
    os: ua.includes("Win") ? "Windows" : ua.includes("Mac") ? "MacOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") ? "iOS" : "Unknown",
  };
}

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}
