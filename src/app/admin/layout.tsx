"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, UserCheck, Banknote, ArrowDownToLine,
  Settings, ScrollText, MessageSquare, ChevronLeft, Menu, LogOut, Moon, Sun,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useTheme } from "next-themes";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof LayoutDashboard> = {
  "layout-dashboard": LayoutDashboard,
  users: Users,
  "user-check": UserCheck,
  banknote: Banknote,
  "arrow-down-to-line": ArrowDownToLine,
  settings: Settings,
  "scroll-text": ScrollText,
  "message-square": MessageSquare,
  "bar-chart-3": BarChart3,
};

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "layout-dashboard" },
  { label: "Analytics", href: "/admin/analytics", icon: "bar-chart-3" },
  { label: "Groups", href: "/admin/groups", icon: "users" },
  { label: "Members", href: "/admin/users", icon: "user-check" },
  { label: "Payouts", href: "/admin/payouts", icon: "banknote" },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: "arrow-down-to-line" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
  { label: "Audit Log", href: "/admin/audit", icon: "scroll-text" },
  { label: "SMS", href: "/admin/sms", icon: "message-square" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    if (!loading && (!user || !["admin", "super_admin", "manager", "support"].includes(user.role))) {
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
            alt="JuliSusu Logo"
            width={120}
            height={40}
            className="h-10 w-auto animate-pulse"
          />
          <p className="text-muted-foreground text-sm">Loading admin...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar (desktop) */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 fixed inset-y-0 z-40",
        sidebarOpen ? "w-60" : "w-16"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          {sidebarOpen && (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="JuliSusu Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-gold-100 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {sidebarOpen && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <Image
            src="/logo.png"
            alt="JuliSusu Logo"
            width={100}
            height={32}
            className="h-8 w-auto"
          />
          <Avatar name={user.name} size="sm" />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 md:hidden"
          >
            <div className="p-4 border-b border-border">
              <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <Image
                  src="/logo.png"
                  alt="JuliSusu Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <nav className="p-2 space-y-1">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-gold-100 text-gold-700" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}

      {/* Main content */}
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-300",
        sidebarOpen ? "md:ml-60" : "md:ml-16",
        "pt-14 md:pt-0"
      )}>
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
