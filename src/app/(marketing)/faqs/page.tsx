"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const faqs = [
  { category: "General", q: "What is Susu?", a: "Susu is a traditional savings practice in Ghana where a group of people contribute a fixed amount of money daily, and each member takes turns receiving the total pool. Juli Smart Susu digitizes this process, making it more secure and convenient." },
  { category: "General", q: "Is Juli Smart Susu safe?", a: "Yes! We use bank-level encryption for all transactions. Every contribution and payout is recorded on our secure platform. Our system ensures transparency and accountability." },
  { category: "General", q: "Do I need a bank account?", a: "No! Juli Smart Susu works entirely with Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money). No bank account required." },
  { category: "Payments", q: "How do I make contributions?", a: "You can pay via Mobile Money directly from the app. You'll receive a daily reminder, and payment takes just a few taps." },
  { category: "Payments", q: "What happens if I miss a payment?", a: "Each group has a grace period (usually 24 hours). After that, a small late fee may apply. Consistent non-payment may result in removal from the group." },
  { category: "Payments", q: "When do I receive my payout?", a: "Payouts follow the turn order in your group. When it's your turn, the entire day's collection from all members is sent directly to your MoMo wallet." },
  { category: "Groups", q: "Can I be in multiple groups?", a: "Yes! Many members join 2-3 groups at different contribution levels to diversify their savings strategy." },
  { category: "Groups", q: "How are turns decided?", a: "Turns are typically assigned in order of joining. Group admins can also adjust the order based on group consensus." },
  { category: "Groups", q: "Can I create my own group?", a: "Yes! You can create a group, set the contribution amount, group size, and rules. Then invite friends or make it public for others to join." },
  { category: "Account", q: "How do I sign up?", a: "Just download the app or visit our website, enter your phone number, and verify with an OTP. That's it - you're ready to start saving!" },
  { category: "Account", q: "Can I change my MoMo number?", a: "Yes, you can update your Mobile Money number in your profile settings at any time." },
  { category: "Account", q: "What if I forget my password?", a: "Use the 'Forgot Password' option on the login page. We'll send a reset code to your registered phone number." },
];

export default function FAQsPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = [...new Set(faqs.map((f) => f.category))];
  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <section className="bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-navy-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to know about Juli Smart Susu
          </p>
          <div className="max-w-md mx-auto">
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      <section className="py-16 max-w-3xl mx-auto px-4">
        {categories.map((category) => {
          const categoryFaqs = filtered.filter((f) => f.category === category);
          if (categoryFaqs.length === 0) return null;
          return (
            <div key={category} className="mb-10">
              <h2 className="text-lg font-bold text-foreground mb-4 text-gold-600">{category}</h2>
              <div className="space-y-3">
                {categoryFaqs.map((faq) => {
                  const index = faqs.indexOf(faq);
                  const isOpen = openIndex === index;
                  return (
                    <div key={index} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium text-foreground pr-4">{faq.q}</span>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
