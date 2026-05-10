import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { resetPasswordSchema } from "@/lib/validation";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the recovery hash automatically and creates a session.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md premium-card p-8 animate-fade-up">
        <h1 className="font-display text-2xl font-medium text-foreground">Choose a new password</h1>
        <p className="text-sm text-muted-foreground mt-1.5 mb-6">
          Min 8 chars, with uppercase, lowercase and a number.
        </p>

        {!ready ? (
          <p className="text-sm text-muted-foreground">Validating reset link…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "New Password", value: password, set: setPassword },
              { label: "Confirm Password", value: confirmPassword, set: setConfirmPassword },
            ].map((f) => (
              <div key={f.label} className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {f.label}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="pl-10 h-11 bg-secondary/40"
                  />
                </div>
              </div>
            ))}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11"
              style={{ background: "var(--gradient-emerald)", color: "hsl(var(--primary-foreground))" }}
            >
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
