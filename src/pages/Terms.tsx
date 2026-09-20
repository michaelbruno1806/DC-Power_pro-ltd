import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const sections = [
  {
    title: "1. Agreement",
    body: "By creating an account on DC Payroll you agree to these terms. If you are signing up on behalf of a company, you confirm you are authorised to bind that company to this agreement.",
  },
  {
    title: "2. Your account",
    body: "You are responsible for keeping your login details confidential and for all activity carried out under your account. Tell us immediately if you believe your account has been accessed without permission.",
  },
  {
    title: "3. Free trial and subscriptions",
    body: "New accounts include a 14-day free trial with full access. After the trial, continued use requires an active subscription. Subscriptions renew for the chosen billing period until cancelled. If payment is not received, the account becomes read-only until the balance is settled.",
  },
  {
    title: "4. Your data",
    body: "Your company and employee data belongs to you. We process it only to run the service for you, and we never sell it. You remain responsible for the accuracy of the data you enter and for the payroll figures you approve and submit.",
  },
  {
    title: "5. Statutory calculations",
    body: "DC Payroll applies Mauritian PAYE, CSG/NSF, PRGF and training levy rules as published. We keep the rates up to date, but you remain responsible for reviewing and approving each payroll run and each return before submission to the MRA.",
  },
  {
    title: "6. Acceptable use",
    body: "You agree not to misuse the service: no attempts to break security, no reverse engineering, no reselling access without a written agreement with us, and no uploading of unlawful content.",
  },
  {
    title: "7. Availability",
    body: "We work to keep the platform available at all times and take regular backups. Planned maintenance is announced in advance where possible. The service is provided without warranty of uninterrupted availability.",
  },
  {
    title: "8. Liability",
    body: "Our total liability in connection with the service is limited to the subscription fees you paid in the twelve months before the claim. We are not liable for indirect losses such as lost profits or penalties arising from figures you approved.",
  },
  {
    title: "9. Ending the agreement",
    body: "You may cancel at any time from your account. On cancellation you keep export access to your data for 30 days. We may suspend an account that breaches these terms.",
  },
  {
    title: "10. Governing law",
    body: "These terms are governed by the laws of the Republic of Mauritius, and the courts of Mauritius have exclusive jurisdiction.",
  },
];

const Terms = () => (
  <div className="min-h-screen bg-background">
    <MarketingNav />

    <section className="pt-32 pb-14 px-5 sm:px-8 bg-hero border-b border-border/60">
      <div className="max-w-3xl mx-auto">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">Legal</div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-3 tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          The rules for using DC Payroll. Written in plain language so you can actually read them.
        </p>
      </div>
    </section>

    <section className="py-16 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-lg font-semibold text-foreground">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{s.body}</p>
          </div>
        ))}
        <div className="pt-6 border-t border-border/60 text-sm text-muted-foreground">
          Questions about these terms? Email{" "}
          <a href="mailto:hello@dcpayroll.mu" className="text-primary hover:underline">
            hello@dcpayroll.mu
          </a>
          .
        </div>
      </div>
    </section>

    <MarketingFooter />
  </div>
);

export default Terms;
