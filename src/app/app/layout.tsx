"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Users, CircleDollarSign, Wallet, User, Bell, Moon, Sun,
  LogOut, Settings, ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: Home },
  { label: "My Groups", href: "/app/groups", icon: Users },
  { label: "Pay", href: "/app/pay", icon: CircleDollarSign },
  { label: "Wallet", href: "/app/wallet", icon: Wallet },
  { label: "Notifications", href: "/app/notifications", icon: Bell },
  { label: "Profile", href: "/app/profile", icon: User },
];

const mobileNavItems = [
  { label: "Home", href: "/app/dashboard", icon: Home },
  { label: "Groups", href: "/app/groups", icon: Users },
  { label: "Pay", href: "/app/pay", icon: CircleDollarSign },
  { label: "Wallet", href: "/app/wallet", icon: Wallet },
  { label: "Profile", href: "/app/profile", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, refreshUser, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center animate-pulse">
            <span className="text-white dark:text-gray-900 font-bold text-sm">JS</span>
          </div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ─── DESKTOP SIDEBAR (md+) ─── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-gray-900 font-bold text-sm">JS</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
              Juli<span className="text-gray-500">Susu</span>
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-4 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.profilePhoto} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-gray-900 dark:text-white" : "text-gray-500")} />
                {item.label}
                {item.label === "Notifications" && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all w-full"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MOBILE HEADER ─── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.profilePhoto} size="sm" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">Hi, {user.name.split(" ")[0]}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" /> : <Moon className="h-4 w-4 text-gray-600" />}
            </button>
            <Link
              href="/app/notifications"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="md:ml-64 min-h-screen">
        {/* Desktop top bar */}
        <div className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {pathname === "/app/dashboard" ? "Dashboard" : pathname.split("/").pop()?.replace(/-/g, " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/app/notifications"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </Link>
            <div className="flex items-center gap-2">
              <Avatar name={user.name} src={user.profilePhoto} size="sm" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name.split(" ")[0]}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0",
                  isActive ? "text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-gray-900 dark:text-white")} />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
