"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Users, ChevronRight, Wallet, Calendar, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface GroupData {
  id: string;
  name: string;
  description?: string;
  type: string;
  group_size: number;
  daily_amount: number;
  payout_amount: number;
  member_count?: number;
  spots_left?: number;
  is_full?: boolean;
  can_join?: boolean;
  status: string;
}

export default function PlansPage() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/groups/list?status=open")
      .then((r) => r.json())
      .then((data) => {
        // The edge function returns { success, data: groups[] }
        const fetched = data?.data || data?.groups || [];
        setGroups(fetched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-950 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Choose Your Savings Group
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Browse available groups created by our team. Pick one that matches your budget, join, and start building your savings today.
          </p>
        </div>
      </section>

      {/* How the pricing works */}
      <section className="py-12 bg-stone-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-gold-600" />
              </div>
              <h3 className="font-semibold text-navy-950 text-sm">Daily Contributions</h3>
              <p className="text-xs text-gray-500">Contribute a fixed amount daily via Mobile Money</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gold-600" />
              </div>
              <h3 className="font-semibold text-navy-950 text-sm">Rotation Cycle</h3>
              <p className="text-xs text-gray-500">Members take turns receiving the full pool</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-gold-600" />
              </div>
              <h3 className="font-semibold text-navy-950 text-sm">Guaranteed Payouts</h3>
              <p className="text-xs text-gray-500">Every member gets paid on time, automated and secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Groups listing */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-navy-950">Available Groups</h2>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? "Loading..." : `${groups.length} group${groups.length !== 1 ? "s" : ""} open for new members`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : groups.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, i) => {
              const spotsLeft = group.spots_left ?? (group.group_size - (group.member_count || 0));
              const memberCount = group.member_count || 0;
              const fillPercent = Math.round((memberCount / group.group_size) * 100);

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="h-full flex flex-col border-border hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    {/* Card header accent */}
                    <div className="h-1.5 bg-gradient-to-r from-gold-400 to-gold-600" />

                    <CardContent className="p-6 flex-1 flex flex-col">
                      {/* Group name & status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-navy-50 flex items-center justify-center">
                            <Users className="h-5 w-5 text-navy-700" />
                          </div>
                          <div>
                            <h3 className="font-bold text-navy-950 text-base">{group.name}</h3>
                            {group.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{group.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="bg-stone-50 rounded-xl p-4 mb-4">
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-xs text-gray-500">GHS</span>
                          <span className="text-3xl font-extrabold text-navy-950">{group.daily_amount}</span>
                          <span className="text-sm text-gray-500">/day</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Payout: <span className="font-bold text-gold-600">{formatCurrency(group.payout_amount)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-3 mb-5 flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Members</span>
                          <span className="font-semibold text-navy-950">{memberCount}/{group.group_size}</span>
                        </div>
                        {/* Fill bar */}
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500"
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${spotsLeft <= 3 ? "text-orange-600" : "text-green-600"}`}>
                            {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                          </span>
                          <span className="text-gray-400">{fillPercent}% full</span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-5 text-xs text-gray-600">
                        <li className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          Mobile Money payments
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          SMS & app reminders
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          Guaranteed automated payouts
                        </li>
                      </ul>

                      {/* CTA */}
                      <div className="mt-auto">
                        <Link href="/signup" className="block">
                          <Button
                            variant={spotsLeft > 0 ? "gold" : "outline"}
                            className="w-full font-bold"
                            disabled={spotsLeft <= 0}
                          >
                            {spotsLeft > 0 ? (
                              <>Join This Group <ChevronRight className="h-4 w-4 ml-1" /></>
                            ) : (
                              "Group Full"
                            )}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-navy-950 mb-2">New Groups Coming Soon</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Our team is setting up new savings groups. Sign up to be notified when groups become available.
            </p>
            <Link href="/signup">
              <Button variant="gold" size="lg">
                Create Account <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {/* Custom Plan CTA */}
        <div className="mt-16 bg-navy-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Need a Custom Group?</h3>
            <p className="text-gray-300 mb-8">
              We offer special packages for corporate groups, associations, and large families. Create a private circle with your own rules.
            </p>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
