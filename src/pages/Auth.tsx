import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import welcomeImg from "@/assets/welcome-landscape.jpg";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  displayName: z.string().trim().min(1).max(50).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = authSchema.safeParse({
      email,
      password,
      displayName: mode === "signup" ? displayName : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        toast.success("Welcome, Whisperer! Check your email to verify your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setSubmitting(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: `${window.location.origin}/`,
    });
    if (result.error) {
      toast.error(result.error.message || `Failed to sign in with ${provider}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <img
        src={welcomeImg}
        alt="Serene landscape"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <p className="text-foreground/50 font-body text-xs tracking-[0.3em] uppercase mb-3">
              Kingdom Whisperers
            </p>
            <h1 className="font-heading text-3xl text-foreground font-bold mb-2">
              {mode === "signin" ? "Welcome Back" : "Begin Your Journey"}
            </h1>
            <p className="text-muted-foreground font-body text-sm">
              {mode === "signin" ? "The whispers await you" : "Create your sacred space"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 mb-5">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground font-body text-sm outline-none focus:border-primary transition-colors"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground font-body text-sm outline-none focus:border-primary transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground font-body text-sm outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body font-semibold shadow-golden hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleOAuth("google")}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-body font-medium text-sm hover:bg-secondary transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleOAuth("apple")}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-body font-medium text-sm hover:bg-secondary transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <p className="text-center mt-6 text-sm font-body text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
