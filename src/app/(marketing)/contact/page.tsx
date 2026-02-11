"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <section className="bg-navy-950 py-20 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-5" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions about joining a group or managing your savings? Our team is here to help you prosper.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Reach out to us through any of these channels. We typically respond within 24 hours.
              </p>
            </div>

            <Card className="bg-navy-50 dark:bg-navy-900 border-none">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 dark:text-white mb-1">Phone & WhatsApp</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mon-Fri from 8am to 5pm</p>
                  <a href="tel:+233200000000" className="text-lg font-semibold text-gold-600 hover:underline">+233 20 000 0000</a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-navy-50 dark:bg-navy-900 border-none">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 dark:text-white mb-1">Email Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">For general inquiries and support</p>
                  <a href="mailto:hello@julismartsusu.com" className="text-lg font-semibold text-gold-600 hover:underline">hello@julismartsusu.com</a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-navy-50 dark:bg-navy-900 border-none">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 dark:text-white mb-1">Visit Our Office</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    123 Independence Avenue<br />
                    Accra, Ghana
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="shadow-xl border-gray-100 dark:border-navy-800">
            <CardContent className="p-8">
              {sent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Message Sent!</h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                    Thank you for reaching out. A member of our team will get back to you shortly.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-8"
                    onClick={() => setSent(false)}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">Send us a Message</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <Input 
                        label="Full Name" 
                        placeholder="Kwame Mensah" 
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                        required 
                        className="bg-gray-50 dark:bg-navy-900 border-gray-200 dark:border-navy-700"
                      />
                      <Input 
                        label="Phone Number" 
                        type="tel" 
                        placeholder="024 123 4567" 
                        value={form.phone} 
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                        className="bg-gray-50 dark:bg-navy-900 border-gray-200 dark:border-navy-700"
                      />
                    </div>
                  </div>
                  
                  <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="kwame@example.com" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    required 
                    className="bg-gray-50 dark:bg-navy-900 border-gray-200 dark:border-navy-700"
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Message</label>
                    <textarea 
                      rows={5} 
                      placeholder="How can we assist you today?" 
                      value={form.message} 
                      onChange={(e) => setForm({ ...form, message: e.target.value })} 
                      className="w-full rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 resize-none transition-all" 
                      required 
                    />
                  </div>
                  
                  <Button type="submit" variant="gold" size="lg" className="w-full font-bold shadow-lg shadow-gold-500/20">
                    Send Message <Send className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
