"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Phone, Mail, Shield, Lock, LogOut, ChevronRight, Moon, Sun, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { formatPhone } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setError("");
    try {
      await updateProfile({ full_name: editForm.name, email: editForm.email });
      setEditOpen(false);
    } catch (err: unknown) {
      const e = err as { error?: string };
      setError(e.error || "Failed to update profile");
    }
    setEditLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) { setError("Passwords do not match"); return; }
    if (passwordForm.new.length < 6) { setError("Password must be at least 6 characters"); return; }
    setPasswordLoading(true);
    setError("");
    try {
      await changePassword(passwordForm.current, passwordForm.new);
      setPasswordOpen(false);
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (err: unknown) {
      const e = err as { error?: string };
      setError(e.error || "Failed to change password");
    }
    setPasswordLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Profile</h1>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar name={user.name} src={user.profilePhoto} size="xl" />
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gold-500 text-navy-900 flex items-center justify-center shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{formatPhone(user.phone)}</p>
            {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.kycStatus === "approved" ? "success" : "warning"}>
                KYC: {user.kycStatus}
              </Badge>
              <Badge variant="secondary">{user.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card>
        <CardContent className="p-2">
          <button onClick={() => setEditOpen(true)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Edit Profile</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => setPasswordOpen(true)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Change Password</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
            <span className="text-xs text-muted-foreground">{theme === "dark" ? "On" : "Off"}</span>
          </button>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>

      {/* Edit Profile Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Edit Profile</SheetTitle></SheetHeader>
          <form onSubmit={handleEditProfile} className="space-y-4 mt-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Input label="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} icon={<User className="h-4 w-4" />} />
            <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} icon={<Mail className="h-4 w-4" />} />
            <Button type="submit" variant="gold" className="w-full" loading={editLoading}>Save Changes</Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Change Password Sheet */}
      <Sheet open={passwordOpen} onOpenChange={setPasswordOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Change Password</SheetTitle></SheetHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Input label="Current Password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} required />
            <Input label="New Password" type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} required />
            <Input label="Confirm Password" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
            <Button type="submit" variant="gold" className="w-full" loading={passwordLoading}>Change Password</Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
