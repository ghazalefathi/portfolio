import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Lock, Loader2, MailCheck, ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { adminExistsQuery } from "@/lib/portfolio-queries";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminExistsQuery()),
  head: () => ({
    meta: [
      { title: "ورود مدیر | Ghazaleh Fathi Portfolio" },
      { name: "description", content: "Admin sign-in for managing the Ghazaleh Fathi portfolio." },
      { property: "og:title", content: "Admin Sign-in | Ghazaleh Fathi Portfolio" },
      { property: "og:description", content: "Private admin area of the portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

type Mode = "login" | "setup" | "forgot";

function AdminLogin() {
  const { data } = useSuspenseQuery(adminExistsQuery());
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(data.exists ? "login" : "setup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Already signed in as admin → go straight to the dashboard
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user || cancelled) return;
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      if (isAdmin && !cancelled) navigate({ to: "/dashboard", replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data: res, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err || !res.user) {
      setBusy(false);
      setError(
        err?.message?.toLowerCase().includes("not confirmed")
          ? "ایمیل شما هنوز تأیید نشده است. لینک تأیید را در صندوق ایمیل باز کنید."
          : "نام کاربری (ایمیل) یا رمز عبور اشتباه است.",
      );
      return;
    }
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: res.user.id, _role: "admin" });
    if (!isAdmin) {
      await supabase.auth.signOut();
      setBusy(false);
      setError("این حساب دسترسی مدیریت ندارد.");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("رمز عبور باید حداقل ۸ کاراکتر باشد."); return; }
    if (password !== confirm) { setError("رمز عبور و تکرار آن یکسان نیستند."); return; }
    setBusy(true);
    const { data: res, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    if (res.session) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    setNotice("حساب مدیر ساخته شد. لینک تأیید به ایمیل شما ارسال شد؛ بعد از تأیید، از همین صفحه وارد شوید.");
    setMode("login");
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setNotice("اگر این ایمیل ثبت شده باشد، لینک تغییر رمز برایتان ارسال شد.");
    setMode("login");
  }

  const titles: Record<Mode, { title: string; sub: string }> = {
    login: { title: "ورود به پنل مدیریت", sub: "با ایمیل و رمز عبور مدیر وارد شوید" },
    setup: {
      title: "ساخت حساب مدیر",
      sub: "هنوز مدیری تعریف نشده. اولین حسابی که اینجا ساخته شود، مدیر سایت خواهد بود.",
    },
    forgot: { title: "بازیابی رمز عبور", sub: "ایمیل مدیر را وارد کنید تا لینک تغییر رمز ارسال شود" },
  };

  return (
    <div dir="rtl" className="font-fa flex min-h-screen items-center justify-center p-4">
      <div className="panel w-full max-w-md space-y-6 p-8 md:p-10">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            {mode === "setup" ? <ShieldCheck className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <h1 className="text-xl font-black text-foreground">{titles[mode].title}</h1>
          <p className="text-xs leading-relaxed text-muted-foreground">{titles[mode].sub}</p>
        </div>

        {notice && (
          <div className="flex items-start gap-2 rounded-2xl border border-success-soft bg-success-soft/60 p-3 text-xs leading-relaxed text-success-strong">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-destructive-soft p-3 text-xs leading-relaxed text-destructive">{error}</div>
        )}

        <form
          onSubmit={mode === "login" ? handleLogin : mode === "setup" ? handleSetup : handleForgot}
          className="space-y-3"
        >
          <label className="block space-y-1">
            <span className="text-xs font-bold text-subtle-foreground">نام کاربری (ایمیل)</span>
            <input
              type="email"
              required
              dir="ltr"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="you@example.com"
            />
          </label>
          {mode !== "forgot" && (
            <label className="block space-y-1">
              <span className="text-xs font-bold text-subtle-foreground">رمز عبور</span>
              <input
                type="password"
                required
                dir="ltr"
                autoComplete={mode === "setup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
              />
            </label>
          )}
          {mode === "setup" && (
            <label className="block space-y-1">
              <span className="text-xs font-bold text-subtle-foreground">تکرار رمز عبور</span>
              <input
                type="password"
                required
                dir="ltr"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="field"
              />
            </label>
          )}

          <Button type="submit" size="pill-lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {mode === "login" ? "ورود به داشبورد" : mode === "setup" ? "ساخت حساب مدیر" : "ارسال لینک بازیابی"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs">
          {mode === "login" ? (
            <button type="button" onClick={() => setMode("forgot")} className="font-semibold text-info hover:underline">
              رمز عبور را فراموش کرده‌ام
            </button>
          ) : data.exists ? (
            <button type="button" onClick={() => setMode("login")} className="font-semibold text-info hover:underline">
              بازگشت به ورود
            </button>
          ) : (
            <span />
          )}
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            مشاهده سایت ←
          </Link>
        </div>
      </div>
    </div>
  );
}
