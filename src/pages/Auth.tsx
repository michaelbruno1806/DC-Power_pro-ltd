import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight } from "lucide-react";
import { signUpSchema, loginSchema } from "@/lib/validation";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const parsed = loginSchema.safeParse({ email: form.email, password: form.password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        const name =
          (data.user?.user_metadata as any)?.full_name ||
          (data.user?.user_metadata as any)?.display_name ||
          data.user?.email;
        toast.success(`Welcome back, ${name}`);
        navigate("/dashboard");
      } else {
        const parsed = signUpSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              full_name: parsed.data.fullName,
              display_name: parsed.data.fullName,
              phone: parsed.data.mobile,
            },
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });
        if (error) throw error;
        toast.success("Account created — check your email to verify.");
        navigate("/verify-email");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message || "Google sign-in failed");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-10">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-up">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center h-14 w-14 rounded-lg font-display font-semibold text-xl text-primary-foreground mb-4"
            style={{ background: "var(--gradient-emerald)", boxShadow: "var(--shadow-glow)" }}
          >
            DC
          </div>
          <h1 className="font-display text-3xl font-medium text-foreground">DC Payroll</h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-2">
            Mauritius · Compliant · Premium
          </p>
        </div>

        <div className="premium-card p-7 backdrop-blur-sm">
          <div className="mb-5">
            <h2 className="font-display text-2xl font-medium text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              {isLogin ? "Sign in to manage your payroll." : "Start your 14-day free trial."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <>
                <Field icon={<User className="h-4 w-4" />} label="Full Name">
                  <Input
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="John Doe"
                    className="pl-10 h-11 bg-secondary/40"
                  />
                </Field>
                <Field icon={<Phone className="h-4 w-4" />} label="Mobile (Mauritius)">
                  <Input
                    value={form.mobile}
                    onChange={(e) => update("mobile", e.target.value)}
                    placeholder="5xxx xxxx"
                    className="pl-10 h-11 bg-secondary/40"
                  />
                </Field>
              </>
            )}

            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@company.com"
                className="pl-10 h-11 bg-secondary/40"
              />
            </Field>

            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 bg-secondary/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            {!isLogin && (
              <>
                <Field icon={<Lock className="h-4 w-4" />} label="Confirm Password">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-secondary/40"
                  />
                </Field>
                <p className="text-[11px] text-muted-foreground">
                  Min 8 chars · 1 uppercase · 1 lowercase · 1 number
                </p>

                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={form.acceptTerms}
                      onCheckedChange={(v) => update("acceptTerms", !!v)}
                      className="mt-0.5"
                    />
                    <span>
                      I accept the <span className="text-primary">Terms &amp; Conditions</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={form.acceptPrivacy}
                      onCheckedChange={(v) => update("acceptPrivacy", !!v)}
                      className="mt-0.5"
                    />
                    <span>
                      I accept the <span className="text-primary">Privacy Policy</span>
                    </span>
                  </label>
                </div>
              </>
            )}

            {isLogin && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-medium gap-2 mt-3 tracking-wide"
              style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
            >
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            className="w-full h-11 gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1H12v3.83h5.36c-.23 1.4-1.65 4.1-5.36 4.1-3.23 0-5.86-2.67-5.86-5.96s2.63-5.96 5.86-5.96c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.95 4.59 14.69 3.6 12 3.6 6.91 3.6 2.8 7.71 2.8 12.8s4.11 9.2 9.2 9.2c5.31 0 8.83-3.73 8.83-8.98 0-.6-.07-1.06-.18-1.52z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "New to DC Payroll? " : "Already have an account? "}
              <span className="text-primary font-medium">{isLogin ? "Create account" : "Sign in"}</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} DC Payroll
          </p>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
      {label}
    </Label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      {children}
    </div>
  </div>
);

export default Auth;
