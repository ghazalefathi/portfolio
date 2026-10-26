import { useEffect, useState } from "react";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/my-supabase";
import { Button } from "@/components/ui/button";
import { Section, TextField } from "./fields";

export function AccountPanel() {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentEmail(data.user?.email ?? ""));
  }, []);

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || newEmail.trim() === currentEmail) return;
    setEmailBusy(true);
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: `${window.location.origin}/dashboard` },
    );
    setEmailBusy(false);
    if (error) { toast.error(error.message); return; }
    setNewEmail("");
    toast.success("لینک تأیید به ایمیل جدید ارسال شد. پس از تأیید، نام کاربری شما تغییر می‌کند.");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("رمز جدید باید حداقل ۸ کاراکتر باشد"); return; }
    if (password !== confirm) { toast.error("رمز جدید و تکرار آن یکسان نیستند"); return; }
    setPwBusy(true);
    // Verify the current password first
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });
    if (verifyError) {
      setPwBusy(false);
      { toast.error("رمز عبور فعلی اشتباه است"); return; }
    }
    const { error } = await supabase.auth.updateUser({ password, current_password: currentPassword });
    setPwBusy(false);
    if (error) { toast.error(error.message); return; }
    setCurrentPassword("");
    setPassword("");
    setConfirm("");
    toast.success("رمز عبور با موفقیت تغییر کرد");
  }

  return (
    <div className="space-y-6">
      <Section title="📧 نام کاربری (ایمیل ورود)" description={`نام کاربری فعلی: ${currentEmail || "…"}`}>
        <form onSubmit={changeEmail} className="space-y-3">
          <TextField label="ایمیل جدید" type="email" value={newEmail} onChange={setNewEmail} ltr required />
          <Button type="submit" size="pill" disabled={emailBusy}>
            {emailBusy ? <Loader2 className="animate-spin" /> : <Mail />}
            تغییر نام کاربری
          </Button>
        </form>
      </Section>

      <Section title="🔑 تغییر رمز عبور">
        <form onSubmit={changePassword} className="space-y-3">
          <TextField label="رمز عبور فعلی" type="password" value={currentPassword} onChange={setCurrentPassword} ltr required />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField label="رمز عبور جدید" type="password" value={password} onChange={setPassword} ltr required />
            <TextField label="تکرار رمز جدید" type="password" value={confirm} onChange={setConfirm} ltr required />
          </div>
          <Button type="submit" size="pill" disabled={pwBusy}>
            {pwBusy ? <Loader2 className="animate-spin" /> : <KeyRound />}
            ذخیره رمز جدید
          </Button>
        </form>
      </Section>
    </div>
  );
}
