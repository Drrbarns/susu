"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, ChevronRight, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useGroups, useCreateGroup } from "@/hooks/use-groups";
import { formatCurrency } from "@/lib/utils";
import { GROUP_STATUSES } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import { createGroupSchema } from "@/lib/validations";

export default function AdminGroupsPage() {
  const [search, setSearch] = useState("");
  const { data: groups, isLoading } = useGroups();
  const [open, setOpen] = useState(false);

  const filtered = groups?.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Groups</h1>
          <p className="text-muted-foreground">Manage all susu groups</p>
        </div>
        <CreateGroupDialog open={open} onOpenChange={setOpen} />
      </div>

      <Input
        placeholder="Search groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="h-4 w-4" />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Group
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Daily
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Members
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Payout
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((g) => {
                    const statusConfig =
                      GROUP_STATUSES[g.status as keyof typeof GROUP_STATUSES] ||
                      GROUP_STATUSES.draft;
                    return (
                      <tr
                        key={g.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/admin/groups/${g.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
                              <Users className="h-4 w-4 text-navy-600 dark:text-navy-300" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {g.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {g.type}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4 hidden md:table-cell text-sm">
                          {formatCurrency(g.daily_amount)}
                        </td>
                        <td className="p-4 hidden md:table-cell text-sm">
                          {g.member_count || 0}/{g.group_size}
                        </td>
                        <td className="p-4">
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-right text-sm font-medium">
                          {formatCurrency(g.payout_amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No groups found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CreateGroupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createGroup = useCreateGroup();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "public",
    daily_amount: "",
    group_size: "",
    days_per_turn: "1",
    payout_amount: "",
    join_fee: "0",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      
      // Auto-calculate payout if other fields change
      if (name === "daily_amount" || name === "group_size" || name === "days_per_turn") {
        const daily = parseFloat(name === "daily_amount" ? value : next.daily_amount) || 0;
        const size = parseInt(name === "group_size" ? value : next.group_size) || 0;
        const days = parseInt(name === "days_per_turn" ? value : next.days_per_turn) || 1;
        if (daily > 0 && size > 0 && days > 0) {
          next.payout_amount = String(daily * days * (size - 1)); // Standard calculation? Or size * daily * days? Usually (size-1) if one takes turns? Or pure savings?
          // Susu usually: Everyone pays daily. One person takes ALL.
          // Total pot = daily_amount * group_size * days_per_turn (if days_per_turn is duration of round?)
          // No, usually days_per_turn is "how often we switch". 
          // Let's assume standard pot = daily_amount * group_size.
          // But wait, the backend calculation logic isn't enforcing it, it just validates input.
          // Let's use simple logic: Payout = Daily * Size * DaysPerTurn (cycle length)
          // Actually, let's keep it manual or simple auto-calc: daily * size.
          next.payout_amount = String(daily * size * days);
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type as "public" | "request" | "paid",
        daily_amount: parseFloat(formData.daily_amount),
        group_size: parseInt(formData.group_size),
        days_per_turn: parseInt(formData.days_per_turn),
        payout_amount: parseFloat(formData.payout_amount),
        join_fee: parseFloat(formData.join_fee),
      };

      // Client-side validation
      const result = createGroupSchema.safeParse(payload);
      if (!result.success) {
        toast.error("Validation Failed", result.error.issues[0].message);
        return;
      }

      await createGroup.mutateAsync(payload);
      toast.success("Group Created", "New susu group has been created successfully.");
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        type: "public",
        daily_amount: "",
        group_size: "",
        days_per_turn: "1",
        payout_amount: "",
        join_fee: "0",
      });
    } catch (error: any) {
      toast.error("Error", error.message || "Failed to create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="gold" size="sm">
          <Plus className="h-4 w-4" /> Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Set up a new susu group configuration.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Group Name</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Makola Market Queens"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="public">Public</option>
                  <option value="request">Request (Private)</option>
                  <option value="paid">Paid Entry</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="group_size" className="text-sm font-medium">Members</label>
                <Input
                  id="group_size"
                  name="group_size"
                  type="number"
                  min="2"
                  value={formData.group_size}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="daily_amount" className="text-sm font-medium">Daily Contribution (GHS)</label>
                <Input
                  id="daily_amount"
                  name="daily_amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.daily_amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="days_per_turn" className="text-sm font-medium">Days Per Turn</label>
                <Input
                  id="days_per_turn"
                  name="days_per_turn"
                  type="number"
                  min="1"
                  value={formData.days_per_turn}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="payout_amount" className="text-sm font-medium">Total Payout (GHS)</label>
                <Input
                  id="payout_amount"
                  name="payout_amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.payout_amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="join_fee" className="text-sm font-medium">Join Fee (GHS)</label>
                <Input
                  id="join_fee"
                  name="join_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.join_fee}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional group description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={createGroup.isPending}>
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
