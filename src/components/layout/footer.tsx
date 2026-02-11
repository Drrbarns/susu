import Link from "next/link";
import Image from "next/image";
import { FOOTER_LINKS } from "@/lib/constants";
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <Image
                src="/logo.png"
                alt="JuliSusu Logo"
                width={160}
                height={55}
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Juli Smart Susu is a digital rotating savings platform. We help you save securely and get paid on time, every time.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-navy-900 transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-gold-500 font-semibold mb-6">Product</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold-500 font-semibold mb-6">Company</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-gold-500 font-semibold mb-6">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest financial tips and platform updates.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-navy-900 border-navy-800 text-white placeholder:text-gray-600 focus-visible:ring-gold-500/50"
              />
              <Button size="icon" className="bg-gold-500 hover:bg-gold-600 text-navy-900 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-navy-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Juli Smart Susu. All rights reserved.</p>
          <div className="flex gap-8">
            {FOOTER_LINKS.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
