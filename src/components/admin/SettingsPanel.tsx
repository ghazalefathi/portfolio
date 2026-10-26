import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/my-supabase";
import { adminSettingsQuery, type SiteSettings } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BiField, ImageField, Section, TextField } from "./fields";

type Editable = Omit<SiteSettings, "id" | "updated_at">;

const EMPTY: Editable = {
  name_fa: "", name_en: "", role_fa: "", role_en: "", avatar_url: "", show_status: true,
  status_fa: "", status_en: "", badge1_fa: "", badge1_en: "", badge2_fa: "", badge2_en: "",
  headline_fa: "", headline_en: "", subtext_fa: "", subtext_en: "",
  works_title_fa: "", works_title_en: "", works_subtitle_fa: "", works_subtitle_en: "",
  skills_title_fa: "", skills_title_en: "", skills_subtitle_fa: "", skills_subtitle_en: "",
  skills_dev_title_fa: "", skills_dev_title_en: "", skills_design_title_fa: "", skills_design_title_en: "",
  contact_title_fa: "", contact_title_en: "", contact_subtitle_fa: "", contact_subtitle_en: "",
  email: "", phone: "",
};

export function SettingsPanel() {
  const { data } = useSuspenseQuery(adminSettingsQuery());
  const qc = useQueryClient();
  const [form, setForm] = useState<Editable>(() => {
    if (!data) return EMPTY;
    const { id: _id, updated_at: _u, ...rest } = data;
    return rest;
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Editable>(key: K) => (v: Editable[K]) => setForm((f) => ({ ...f, [key]: v }));
  const bi = (base: string) => ({
    fa: form[`${base}_fa` as keyof Editable] as string,
    en: form[`${base}_en` as keyof Editable] as string,
    onFa: set(`${base}_fa` as keyof Editable) as (v: string) => void,
    onEn: set(`${base}_en` as keyof Editable) as (v: string) => void,
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ id: 1, ...form });
    setSaving(false);
    if (error) { toast.error(`ذخیره نشد: ${error.message}`); return; }
    toast.success("اطلاعات سایت ذخیره شد");
    qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <Section title="👤 مشخصات اصلی" description="نام، عنوان شغلی، عکس پروفایل و وضعیت که بالای سایت نمایش داده می‌شود.">
        <BiField label="نام" {...bi("name")} required />
        <BiField label="عنوان شغلی" {...bi("role")} />
        <ImageField label="عکس پروفایل" value={form.avatar_url} onChange={set("avatar_url")} folder="avatar" round />
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
          <div>
            <p className="text-xs font-bold">نمایش وضعیت «آماده به‌کار»</p>
            <p className="text-[11px] text-muted-foreground">نشان سبز کنار نام در نوار بالا</p>
          </div>
          <Switch checked={form.show_status} onCheckedChange={set("show_status")} dir="ltr" />
        </div>
        {form.show_status && <BiField label="متن وضعیت" {...bi("status")} />}
      </Section>

      <Section title="🏷️ نشان‌های تخصص" description="دو برچسب رنگی کنار کارت معرفی.">
        <BiField label="نشان اول" {...bi("badge1")} />
        <BiField label="نشان دوم" {...bi("badge2")} />
      </Section>

      <Section title="✨ متن معرفی (درباره من)">
        <BiField label="تیتر اصلی" {...bi("headline")} />
        <BiField label="متن درباره من" {...bi("subtext")} multiline rows={5} />
      </Section>

      <Section title="🧩 عنوان بخش‌ها">
        <BiField label="عنوان بخش نمونه‌کارها" {...bi("works_title")} />
        <BiField label="زیرعنوان نمونه‌کارها" {...bi("works_subtitle")} />
        <BiField label="عنوان بخش مهارت‌ها" {...bi("skills_title")} />
        <BiField label="زیرعنوان مهارت‌ها" {...bi("skills_subtitle")} />
        <BiField label="عنوان گروه مهارت‌های برنامه‌نویسی" {...bi("skills_dev_title")} />
        <BiField label="عنوان گروه مهارت‌های طراحی" {...bi("skills_design_title")} />
        <BiField label="عنوان بخش تماس" {...bi("contact_title")} />
        <BiField label="زیرعنوان تماس" {...bi("contact_subtitle")} />
      </Section>

      <Section title="📞 اطلاعات تماس">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TextField label="ایمیل تماس" type="email" value={form.email} onChange={set("email")} ltr />
          <TextField label="شماره تماس" value={form.phone} onChange={set("phone")} ltr />
        </div>
      </Section>

      <div className="sticky bottom-4 z-10">
        <Button type="submit" size="pill-lg" className="w-full shadow-lg" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          ذخیره تمام اطلاعات سایت
        </Button>
      </div>
    </form>
  );
}
