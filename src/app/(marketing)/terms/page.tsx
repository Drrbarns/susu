import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Juli Smart Susu Terms of Service.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
      <div className="space-y-6">
        <p className="text-muted-foreground">Last updated: February 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">By accessing and using Juli Smart Susu, you agree to be bound by these Terms of Service.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">Juli Smart Susu provides a digital platform for group savings (susu). Users can join or create groups, make daily contributions via Mobile Money, and receive payouts according to the group schedule.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>You must provide accurate registration information</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must make contributions on time according to your group schedule</li>
            <li>You must not use the platform for fraudulent activities</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Contributions and Payouts</h2>
          <p className="text-muted-foreground leading-relaxed">Contributions are processed via Mobile Money. Late payments may incur fees as specified by the group rules. Payouts are made automatically when it is your scheduled turn.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Fees</h2>
          <p className="text-muted-foreground leading-relaxed">Juli Smart Susu may charge service fees on transactions. All applicable fees will be clearly displayed before you confirm any transaction.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">Juli Smart Susu facilitates the savings process but is not responsible for individual member defaults within groups.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For questions about these terms, contact us at legal@julismartsusu.com</p>
        </section>
      </div>
    </div>
  );
}
