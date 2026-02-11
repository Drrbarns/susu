"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const contactInfo = [
  { icon: Phone, label: "Phone", value: "+233 20 000 0000" },
  { icon: Mail, label: "Email", value: "hello@julismartsusu.com" },
  { icon: MapPin, label: "Office", value: "Accra, Ghana" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <section className="bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-navy-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Contact Us</h1>
          <p className="text-lg text-muted-foreground">Have a question? We would love to hear from you.</p>
        </div>
      </section>
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((info) => (
            <Card key={info.label}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center mx-auto mb-3">
                  <info.icon className="h-6 w-6 text-gold-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{info.label}</h3>
                <p className="text-sm text-muted-foreground">{info.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h2>
                <p className="text-muted-foreground">We will get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-foreground mb-2">Send us a message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="Kofi Mensah" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <Input label="Phone" type="tel" placeholder="0241234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <Input label="Email" type="email" placeholder="kofi@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Message</label>
                  <textarea rows={4} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none" required />
                </div>
                <Button type="submit" variant="gold" size="lg" className="w-full">Send Message <Send className="h-4 w-4" /></Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
