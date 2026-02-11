"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Plus, Users, Filter, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGroups, useCreateGroup } from "@/hooks/use-groups";
import { formatCurrency } from "@/lib/utils";
import { GROUP_STATUSES } from "@/lib/constants";
import type { SusuGroup } from "@/types";

function GroupCard({ group }: { group: SusuGroup }) {
  const statusConfig = GROUP_STATUSES[group.status as keyof typeof GROUP_STATUSES] || GROUP_STATUSES.draft;
  return (
    <Link href={`/app/groups/${group.id}`}>
      <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-navy-600 dark:text-navy-300" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{group.name}</h3>
                <p className="text-xs text-muted-foreground">{group.member_count || 0}/{group.group_size} members</p>
              </div>
            </div>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Daily</p>
              <p className="font-bold text-sm text-foreground">{formatCurrency(group.daily_amount)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Payout</p>
              <p className="font-bold text-sm text-foreground">{formatCurrency(group.payout_amount)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Spots</p>
              <p className="font-bold text-sm text-foreground">{group.spots_left ?? (group.group_size - (group.member_count || 0))}</p>
            </div>
          </div>
          <div className="flex items-center justify-end mt-3 text-xs text-gold-600">
            View Details <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CreateGroupSheet() {
  const createGroup = useCreateGroup();
  const [form, setForm] = useState({ name: "", description: "", daily_amount: "", group_size: "", type: "public" });
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGroup.mutateAsync({
      name: form.name,
      description: form.description,
      daily_amount: Number(form.daily_amount),
      group_size: Number(form.group_size),
      type: form.type,
    });
    setOpen(false);
    setForm({ name: "", description: "", daily_amount: "", group_size: "", type: "public" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Create</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>Create New Group</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input label="Group Name" placeholder="e.g. Market Women Susu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Daily Amount (GHS)" type="number" placeholder="20" value={form.daily_amount} onChange={(e) => setForm({ ...form, daily_amount: e.target.value })} required />
            <Input label="Group Size" type="number" placeholder="30" value={form.group_size} onChange={(e) => setForm({ ...form, group_size: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Group Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm">
              <option value="public">Public - Anyone can join</option>
              <option value="request">Request - Approval needed</option>
              <option value="paid">Paid - Join fee required</option>
            </select>
          </div>
          <Button type="submit" variant="gold" className="w-full" loading={createGroup.isPending}>
            Create Group
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const { data: groups, isLoading } = useGroups();

  const filtered = groups?.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Groups</h1>
        <CreateGroupSheet />
      </div>

      <Input
        placeholder="Search groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="h-4 w-4" />}
      />

      <Tabs defaultValue="my">
        <TabsList className="w-full">
          <TabsTrigger value="my" className="flex-1">My Groups</TabsTrigger>
          <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          {isLoading ? (
            <div className="space-y-3 mt-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="space-y-3 mt-4">
              {filtered.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GroupCard group={g} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">No groups found</p>
              <p className="text-sm">Create a new group or browse available ones</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover">
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-1">Discover Groups</p>
            <p className="text-sm">Browse public groups you can join</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
