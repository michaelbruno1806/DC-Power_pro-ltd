import MarketingPage from "@/components/marketing/MarketingPage";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Wallet, FileText, Landmark, CalendarDays, Users } from "lucide-react";

const shots = [
  { title: "Dashboard", desc: "Monthly checklist, gross payroll, PAYE and net cost at a glance.", icon: LayoutDashboard },
  { title: "Payroll run", desc: "Per-employee breakdown with live recalculation before you finalise.", icon: Wallet },
  { title: "Payslips", desc: "Branded PDF payslips, generated in bulk or one by one.", icon: FileText },
  { title: "MRA filings", desc: "PAYE, CSG/NSF and PRGF returns exported in MRA format.", icon: Landmark },
  { title: "Leaves", desc: "Colour-coded calendar with balances, payouts and resets.", icon: CalendarDays },
  { title: "Employees", desc: "Records, bank details, documents and salary structures.", icon: Users },
];

const Gallery = () => (
  <MarketingPage eyebrow="03 / A look inside" title="Gallery" description="Every module of DC Payroll, from the monthly checklist to the MRA export.">
    <section className="py-16 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shots.map((s, index) => (
          <article key={s.title} className="gallery-item overflow-hidden rounded-sm border border-border">
            <div className="gallery-art relative flex h-52 items-center justify-center border-b border-border bg-secondary/40">
              <span className="absolute left-5 top-4 text-xs text-muted-foreground">0{index + 1} / DC Payroll</span>
              <s.icon className="gallery-symbol h-20 w-20 text-primary" strokeWidth={1} aria-hidden="true" />
            </div>
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold">{s.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-14 text-center">
        <Button asChild size="lg" className="landing-action h-12 px-7">
          <Link to="/auth?mode=signup">See it with your own data <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </section>

  </MarketingPage>
);

export default Gallery;
