import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "تغییر رمز عبور | Ghazaleh Fathi Portfolio" },
      { name: "description", content: "Set a new admin password for the portfolio." },
      { property: "og:title", content: "Reset Password | Ghazaleh Fathi Portfolio" },
      { property: "og:description", content: "Set a new admin password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session && isRecovery) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("رمز عبور باید حداقل ۸ کاراکتر باشد."); return; }
    if (password !== confirm) { setError("رمز عبور و تکرار آن یکسان نیستند."); return; }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) { setError(err.message); return; }
    toast.success("رمز عبور تغییر کرد");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div dir="rtl" className="font-fa flex min-h-screen items-center justify-center p-4">
      <div className="panel w-full max-w-md space-y-6 p-8 md:p-10">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black">رمز عبور جدید</h1>
          <p className="text-xs text-muted-foreground">
            {ready ? "رمز عبور جدید خود را وارد کنید" : "در حال بررسی لینک بازیابی… اگر این پیام ماند، لینک را دوباره از ایمیل باز کنید."}
          </p>
        </div>
        {error && <div className="rounded-2xl bg-destructive-soft p-3 text-xs text-destructive">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            dir="ltr"
            required
            placeholder="رمز عبور جدید"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            disabled={!ready}
          />
          <input
            type="password"
            dir="ltr"
            required
            placeholder="تکرار رمز عبور"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="field"
            disabled={!ready}
          />
          <Button type="submit" size="pill-lg" className="w-full" disabled={!ready || busy}>
            {busy && <Loader2 className="animate-spin" />}
            ذخیره رمز جدید
          </Button>
        </form>
      </div>
    </div>
  );
}
