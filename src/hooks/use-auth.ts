"use client";

import { useAuthStore } from "@/lib/auth";

export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    loading: store.loading,
    isAdmin: store.user?.role === "admin" || store.user?.role === "super_admin",
    login: store.login,
    signup: store.signup,
    logout: store.logout,
    refreshUser: store.refreshUser,
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
  };
}
