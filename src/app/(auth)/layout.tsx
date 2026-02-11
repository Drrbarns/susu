import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
            <span className="text-navy-900 font-bold text-sm">JS</span>
          </div>
          <span className="text-white font-semibold text-lg">Juli Smart Susu</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <div className="fixed top-0 right-0 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
    </div>
  );
}
