import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const sections = [
  {
    title: "What we collect",
    body: "Account details you give us (name, email, mobile number), your company details (name, BRN, TAN, VAT, address), the employee and payroll records you enter, and basic technical information such as sign-in times needed to keep the account secure.",
  },
  {
    title: "Why we use it",
    body: "Only to provide the service: running payroll, producing payslips, preparing MRA returns, managing leave, sending service emails and supporting you when you ask for help.",
  },
  {
    title: "What we never do",
    body: "We do not sell your data, we do not share employee records with advertisers, and we do not use your payroll data to train anything. Your workspace is isolated from every other company on the platform.",
  },
  {
    title: "Who can see your data",
    body: "People you invite to your workspace, according to the role you give them. Accountants you invite see only the companies you link to them. Our team accesses data only when you request support, and access is logged.",
  },
  {
    title: "Where it lives",
    body: "Data is stored on managed cloud infrastructure, encrypted in transit and at rest, with regular automated backups.",
  },
  {
    title: "How long we keep it",
    body: "For as long as your account is active, plus the retention period Mauritian payroll law requires. After you close an account you have 30 days to export everything, after which records are deleted on request.",
  },
  {
    title: "Your rights",
    body: "You can ask for a copy of your data, ask us to correct it, or ask us to delete it. Employees should make these requests through their employer, who controls the records.",
  },
  {
    title: "Cookies",
    body: "We use only the cookies needed to keep you signed in and remember your display preferences, such as light or dark mode. No advertising trackers.",
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <MarketingNav />

    <section className="pt-32 pb-14 px-5 sm:px-8 bg-hero border-b border-border/60">
      <div className="max-w-3xl mx-auto">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">Legal</div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-3 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          Payroll is sensitive. Here is exactly what we hold, why we hold it, and what we never do with it.
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
          Privacy requests:{" "}
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

export default Privacy;
