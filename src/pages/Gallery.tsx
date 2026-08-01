import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const shots = [
  { title: "Dashboard", desc: "Monthly checklist, gross payroll, PAYE and net cost at a glance.", tone: "from-primary/25" },
  { title: "Payroll run", desc: "Per-employee breakdown with live recalculation before you finalise.", tone: "from-primary/15" },
  { title: "Payslips", desc: "Branded PDF payslips, generated in bulk or one by one.", tone: "from-primary/20" },
  { title: "MRA filings", desc: "PAYE, CSG/NSF and PRGF returns exported in MRA format.", tone: "from-primary/10" },
  { title: "Leaves", desc: "Colour-coded calendar with balances, payouts and resets.", tone: "from-primary/20" },
  { title: "Employees", desc: "Records, bank details, documents and salary structures.", tone: "from-primary/15" },
];

const Gallery = () => (
  <div className="min-h-screen bg-background text-foreground">
    <MarketingNav />

    <section className="bg-hero pt-32 pb-16 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <p className="font-script text-3xl text-primary">A look inside —</p>
        <h1 className="font-display text-4xl sm:text-6xl text-foreground mt-1">Gallery</h1>
        <p className="text-muted-foreground mt-4 max-w-xl">
          Every module of DC Payroll, from the monthly checklist to the MRA export.
        </p>
      </div>
    </section>

    <section className="py-16 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shots.map((s) => (
          <div key={s.title} className="premium-card overflow-hidden p-0 hover:-translate-y-1 transition-all duration-300">
            <div className={`h-44 bg-gradient-to-br ${s.tone} to-transparent border-b border-border/50 flex items-end p-5`}>
              <span className="font-display text-xl font-semibold text-foreground">{s.title}</span>
            </div>
            <p className="text-sm text-muted-foreground p-5 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-14 text-center">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 rounded-full px-7 h-12 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-emerald)" }}
        >
          See it with your own data <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>

    <MarketingFooter />
  </div>
);

export default Gallery;
