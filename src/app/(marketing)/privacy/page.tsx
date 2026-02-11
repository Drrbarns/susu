import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Juli Smart Susu Privacy Policy - How we protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: February 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Personal Information:</strong> Name, phone number, email address, Mobile Money number</li>
            <li><strong>KYC Information:</strong> Ghana Card number, ID documents (for verification)</li>
            <li><strong>Transaction Data:</strong> Contributions, payouts, withdrawal history</li>
            <li><strong>Device Information:</strong> Device type, browser, IP address for security</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>To process your contributions and payouts</li>
            <li>To verify your identity and prevent fraud</li>
            <li>To send you reminders and notifications about your groups</li>
            <li>To improve our services and user experience</li>
            <li>To comply with legal and regulatory requirements</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">We use industry-standard encryption to protect your data in transit and at rest. Access to personal data is restricted to authorized personnel only.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">We do not sell your personal data. We may share limited information with payment processors (Mobile Money providers) to facilitate transactions, and with law enforcement if required by law.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">6. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For privacy-related inquiries, contact our Data Protection Officer at privacy@julismartsusu.com</p>
        </section>
      </div>
    </div>
  );
}
