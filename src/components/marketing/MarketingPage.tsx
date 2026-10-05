import type { ReactNode } from "react";
import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";

interface MarketingPageProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function MarketingPage({ eyebrow, title, description, children }: MarketingPageProps) {
  return (
    <div className="landing-editorial marketing-page min-h-screen bg-background text-foreground">
      <MarketingNav />
      <main className="pt-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-border px-5 py-4 sm:px-8">
          <span className="font-display text-sm font-bold uppercase">DC Payroll <span className="text-primary">/ Mauritius</span></span>
          <span className="text-xs text-muted-foreground">{eyebrow}</span>
        </div>
        <header className="border-b border-border px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[3fr_2fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs font-bold uppercase text-primary">{eyebrow}</p>
              <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">{title}</h1>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
          </div>
        </header>
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}