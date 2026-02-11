"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Users, CircleDollarSign, Wallet, User, Bell, Moon, Sun,
  LogOut, Settings, ChevronRight, Menu, ChevronLeft
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="JuliSmart Susu"
            width={120}
            height={40}
            className="h-10 w-auto animate-pulse"
          />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* ─── DESKTOP SIDEBAR (md+) ─── */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 fixed inset-y-0 z-40",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border h-16">
          {sidebarOpen && (
            <Link href="/app/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="JuliSmart Susu"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={cn("p-1.5 rounded-md hover:bg-muted transition-colors", !sidebarOpen && "mx-auto")}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="px-4 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.profilePhoto} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-gold-100 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", !sidebarOpen && "mx-auto")} />
                {sidebarOpen && (
                  <>
                    <span>{item.label}</span>
                    {item.label === "Notifications" && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={!sidebarOpen ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
          >
            {theme === "dark" ? <Sun className={cn("h-4 w-4", !sidebarOpen && "mx-auto")} /> : <Moon className={cn("h-4 w-4", !sidebarOpen && "mx-auto")} />}
            {sidebarOpen && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut className={cn("h-4 w-4", !sidebarOpen && "mx-auto")} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── MOBILE HEADER ─── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 bg-card border-b border-border">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors">
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <p className="text-sm font-semibold text-foreground leading-none">Hi, {user.name.split(" ")[0]}</p>
              <p className="text-xs text-muted-foreground">Welcome back</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            </button>
            <Link
              href="/app/notifications"
              className="p-2 rounded-lg hover:bg-muted transition-colors relative"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MOBILE SIDEBAR DRAWER ─── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 md:hidden flex flex-col"
          >
            {/* Drawer header */}
            <div className="p-4 border-b border-border">
              <Link href="/app/dashboard" onClick={() => setMobileOpen(false)} className="inline-block">
                <Image src="/logo.png" alt="JuliSmart Susu" width={120} height={40} className="h-8 w-auto" />
              </Link>
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} src={user.profilePhoto} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email || user.phone}</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gold-100 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.label === "Notifications" && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer */}
            <div className="p-2 border-t border-border space-y-1">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "md:ml-16",
        "pt-14 md:pt-0"
      )}>
        {/* Desktop top bar */}
        <div className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between px-8 bg-background/80 backdrop-blur-sm border-b border-border">
          <div>
            <h1 className="text-lg font-bold text-foreground capitalize">
              {pathname === "/app/dashboard" ? "Dashboard" : pathname.split("/").pop()?.replace(/-/g, " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/app/notifications"
              className="p-2 rounded-lg hover:bg-muted transition-colors relative"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </Link>
            <div className="flex items-center gap-2">
              <Avatar name={user.name} src={user.profilePhoto} size="sm" />
              <span className="text-sm font-medium text-foreground">{user.name.split(" ")[0]}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-8">
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

      {/*
        ─── PWA MOBILE BOTTOM NAV (COMMENTED OUT) ───
        TODO: Uncomment this section when converting to PWA.
        This bottom tab bar (Home, Groups, Pay, Wallet, Profile) provides native-app-like
        navigation ideal for a PWA experience. It was removed in favor of the hamburger
        sidebar drawer for the standard responsive web version.

        When re-enabling for PWA:
        1. Uncomment the <nav> block below
        2. Optionally hide the hamburger button in the mobile header
        3. Reduce the sidebar to only show secondary items (Notifications, Settings, Logout)
        4. Adjust the main content padding-bottom back to pb-24

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0",
                  isActive ? "text-gold-600" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-gold-500")} />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      */}
    </div>
  );
}
