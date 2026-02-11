"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";

const faqs = [
  { category: "General", q: "What is Susu?", a: "Susu is a traditional savings practice in Ghana where a group of people contribute a fixed amount of money daily, and each member takes turns receiving the total pool. JuliSmart Susu digitizes this process, making it more secure and convenient." },
  { category: "General", q: "Is JuliSmart Susu safe?", a: "Yes! We use bank-level encryption for all transactions. Every contribution and payout is recorded on our secure platform. Our system ensures transparency and accountability." },
  { category: "General", q: "Do I need a bank account?", a: "No! JuliSmart Susu works entirely with Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money). No bank account required." },
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
      <section className="bg-navy-950 py-24 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-5" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
            Everything you need to know about secure digital savings with JuliSmart Susu.
          </p>
          <div className="max-w-lg mx-auto relative">
            <Input
              placeholder="Search for answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-full focus:bg-white/20 focus:border-gold-500 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </section>

      <section className="py-20 max-w-3xl mx-auto px-4">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No matching questions found.</p>
          </div>
        )}
        
        {categories.map((category) => {
          const categoryFaqs = filtered.filter((f) => f.category === category);
          if (categoryFaqs.length === 0) return null;
          return (
            <div key={category} className="mb-12">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gold-500 rounded-full" />
                {category}
              </h2>
              <div className="space-y-4">
                {categoryFaqs.map((faq) => {
                  const index = faqs.indexOf(faq);
                  const isOpen = openIndex === index;
                  return (
                    <div 
                      key={index} 
                      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                        isOpen 
                          ? "border-gold-500/30 bg-gold-50/30 dark:bg-gold-900/10 shadow-sm" 
                          : "border-gray-200 dark:border-navy-700 hover:border-gray-300 dark:hover:border-navy-600"
                      }`}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <span className={`font-semibold pr-4 text-lg ${isOpen ? "text-navy-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                          {faq.q}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? "bg-gold-100 text-gold-600" : "bg-gray-100 dark:bg-navy-800 text-gray-500"
                        }`}>
                          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-6 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed">
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
