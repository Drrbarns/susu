"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGroups } from "@/hooks/use-groups";
import { formatCurrency } from "@/lib/utils";
import { GROUP_STATUSES } from "@/lib/constants";
import type { SusuGroup } from "@/types";

function GroupCard({ group }: { group: SusuGroup }) {
  const statusConfig = GROUP_STATUSES[group.status as keyof typeof GROUP_STATUSES] || GROUP_STATUSES.draft;
  const spotsLeft = group.spots_left ?? (group.group_size - (group.member_count || 0));

  return (
    <Link href={`/app/groups/${group.id}`}>
      <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{group.name}</h3>
                <p className="text-xs text-muted-foreground">{group.member_count || 0}/{group.group_size} members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {spotsLeft > 0 && (
                <Badge variant="success" className="text-[10px]">{spotsLeft} spots</Badge>
              )}
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-1.5 sm:p-2">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Daily</p>
              <p className="font-bold text-xs sm:text-sm text-foreground">{formatCurrency(group.daily_amount)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-1.5 sm:p-2">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Payout</p>
              <p className="font-bold text-xs sm:text-sm text-foreground">{formatCurrency(group.payout_amount)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-1.5 sm:p-2">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Spots</p>
              <p className="font-bold text-xs sm:text-sm text-foreground">{spotsLeft}</p>
            </div>
          </div>
          <div className="flex items-center justify-end mt-3 text-xs text-gold-600 font-medium">
            View Details <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const { data: groups, isLoading } = useGroups();

  // Split into groups user is a member of vs all available groups
  const myGroups = groups?.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) && g.user_membership
  );
  const availableGroups = groups?.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) && !g.user_membership
  );

  // If the API doesn't distinguish, show all in both tabs
  const filteredAll = groups?.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Groups</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse savings groups and join one that fits you</p>
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
          ) : (myGroups && myGroups.length > 0) ? (
            <div className="space-y-3 mt-4">
              {myGroups.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GroupCard group={g} />
                </motion.div>
              ))}
            </div>
          ) : (filteredAll && filteredAll.length > 0) ? (
            // Fallback: if no user_membership field, show all groups
            <div className="space-y-3 mt-4">
              {filteredAll.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GroupCard group={g} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">No groups yet</p>
              <p className="text-sm">Check the Discover tab to find groups to join</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover">
          {isLoading ? (
            <div className="space-y-3 mt-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : (availableGroups && availableGroups.length > 0) ? (
            <div className="space-y-3 mt-4">
              {availableGroups.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GroupCard group={g} />
                </motion.div>
              ))}
            </div>
          ) : (filteredAll && filteredAll.length > 0) ? (
            <div className="space-y-3 mt-4">
              {filteredAll.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GroupCard group={g} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">No groups available</p>
              <p className="text-sm">New groups will appear here when created by the admin</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
