import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, RotateCw, LogOut } from "lucide-react";

const VerifyEmail = () => {
  const { user, emailVerified, signOut, refreshMeta } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/auth" replace />;
  if (emailVerified) return <Navigate to="/onboarding" replace />;

  const resend = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email!,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Verification email re-sent.");
  };

  const checkAgain = async () => {
    await supabase.auth.refreshSession();
    await refreshMeta();
    const { data } = await supabase.auth.getUser();
    if (data.user?.email_confirmed_at) {
      toast.success("Email verified!");
      navigate("/onboarding");
    } else {
      toast.info("Not verified yet. Please click the link in your email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md premium-card p-8 text-center animate-fade-up">
        <div
          className="inline-flex h-14 w-14 items-center justify-center rounded-full mb-4"
          style={{ background: "var(--gradient-emerald)" }}
        >
          <Mail className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-medium text-foreground">Verify your email</h1>
        <p className="text-sm text-muted-foreground mt-2">
          We sent a verification link to <span className="text-foreground">{user.email}</span>.
          Open it to activate your account and start your 14-day free trial.
        </p>

        <div className="space-y-2 mt-6">
          <Button onClick={checkAgain} className="w-full h-11 gap-2" variant="outline">
            <RotateCw className="h-4 w-4" /> I've verified — continue
          </Button>
          <Button onClick={resend} disabled={loading} className="w-full h-11" variant="ghost">
            {loading ? "Sending..." : "Resend verification email"}
          </Button>
          <Button
            onClick={() => signOut().then(() => navigate("/auth"))}
            className="w-full h-11 gap-2"
            variant="ghost"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
