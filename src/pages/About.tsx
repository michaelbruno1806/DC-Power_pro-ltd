import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Heart, Award } from "lucide-react";
import MarketingPage from "@/components/marketing/MarketingPage";

const About = () => {
  const navigate = useNavigate();

  return (
    <MarketingPage eyebrow="01 / Our story" title="Making payroll simple for Mauritius" description="DC Payroll was born out of a simple observation: payroll in Mauritius is unnecessarily complex. We built a platform that automates the tedious parts so you can focus on your business.">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            { icon: Target, title: "Our Mission", desc: "To eliminate payroll errors and save businesses hours every month through intelligent automation." },
            { icon: Heart, title: "Our Values", desc: "Accuracy, simplicity, and compliance. Every feature is designed with the Mauritian regulatory framework in mind." },
            { icon: Award, title: "Our Promise", desc: "Enterprise-grade payroll software at a price that small and medium businesses can afford." },
          ].map((item) => (
            <div key={item.title} className="premium-card p-6">
              <div className="h-10 w-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-medium text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 border-y border-border py-10">
          <h2 className="font-display text-2xl font-medium text-foreground mb-4">Built by MB18 Solutions</h2>
          <p className="text-muted-foreground leading-relaxed">
            DC Payroll is a product of MB18 Solutions, a Mauritian software company specialising in
            enterprise-grade business tools. With deep expertise in payroll regulation and modern web
            technologies, we deliver solutions that are both beautiful and reliable.
          </p>
        </div>

        <div className="text-center mt-16">
          <Button
            onClick={() => navigate("/auth?mode=signup")}
            className="landing-action gap-2 rounded-sm h-12 px-7"
          >
            Start free trial
          </Button>
        </div>
      </div>
    </MarketingPage>

  );
};

export default About;
