import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JuliSmart Susu | Save Together, Prosper Together",
    template: "%s | JuliSmart Susu",
  },
  description:
    "Join trusted susu groups in Ghana. Daily contributions, guaranteed payouts. Save smarter with JuliSmart Susu.",
  keywords: ["susu", "ghana", "savings", "mobile money", "momo", "group savings", "rotating savings"],
  authors: [{ name: "JuliSmart Susu" }],
  openGraph: {
    type: "website",
    locale: "en_GH",
    siteName: "JuliSmart Susu",
    title: "JuliSmart Susu | Save Together, Prosper Together",
    description: "Join trusted susu groups in Ghana. Daily contributions, guaranteed payouts.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "JuliSmart Susu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JuliSmart Susu",
    description: "Join trusted susu groups in Ghana. Daily contributions, guaranteed payouts.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A1F44" },
    { media: "(prefers-color-scheme: dark)", color: "#050F22" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
