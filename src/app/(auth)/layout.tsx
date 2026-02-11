import Link from "next/link";
import { Shield, Users, TrendingUp, Star } from "lucide-react";

const stats = [
  { value: "15,000+", label: "Active Savers", icon: Users },
  { value: "99.9%", label: "Payout Rate", icon: TrendingUp },
  { value: "4.9/5", label: "User Rating", icon: Star },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ─── LEFT BRANDING PANEL (desktop only) ─── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative flex-col bg-navy-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0v40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-grid)" />
          </svg>
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-8 xl:p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-navy-900 font-bold text-sm">JS</span>
            </div>
            <span className="font-bold text-white text-xl tracking-tight">
              Juli<span className="text-gold-400">Susu</span>
            </span>
          </Link>

          {/* Main message */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-medium text-gold-300 mb-5">
                  <Shield className="h-3 w-3" />
                  Trusted by 15,000+ Ghanaians
                </div>
                <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
                  Save Together,<br />
                  <span className="text-gold-400">Prosper Together.</span>
                </h1>
                <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
                  Join the most trusted digital susu platform in Ghana. Make daily contributions, get guaranteed payouts, and build your future.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 pt-2">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                &ldquo;I saved GHS 5,000 to expand my shop. The transparency and automated payouts gave me confidence to save consistently.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-xs font-bold text-gold-400">
                  AS
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Ama Serwaa</p>
                  <p className="text-[11px] text-gray-500">Trader, Accra</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-[11px] text-gray-600">
            &copy; {new Date().getFullYear()} Juli Smart Susu. Licensed and regulated.
          </div>
        </div>
      </div>

      {/* ─── RIGHT FORM PANEL ─── */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">JS</span>
            </div>
            <span className="font-bold text-navy-950 text-lg tracking-tight">
              Juli<span className="text-gold-600">Susu</span>
            </span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="w-full max-w-[440px]">
            {children}
          </div>
        </div>

        {/* Bottom text (mobile) */}
        <div className="lg:hidden text-center pb-6 px-4">
          <p className="text-[11px] text-gray-400">
            &copy; {new Date().getFullYear()} Juli Smart Susu. Licensed and regulated.
          </p>
        </div>
      </div>
    </div>
  );
}
