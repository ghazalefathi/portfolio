import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { adminSkillsQuery, type Skill } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Section, TextField } from "./fields";
import { cn } from "@/lib/utils";

const GROUPS = [
  { key: "dev", label: "برنامه‌نویسی (Flutter و Dart)", tone: "text-code-strong" },
  { key: "design", label: "طراحی UI/UX", tone: "text-design" },
] as const;

export function SkillsPanel() {
  const { data: skills } = useSuspenseQuery(adminSkillsQuery());
  const qc = useQueryClient();
  const [group, setGroup] = useState<"dev" | "design">("dev");
  const [fa, setFa] = useState("");
  const [en, setEn] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "skills"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!fa.trim() && !en.trim()) return;
    setBusy(true);
    const maxOrder = Math.max(0, ...skills.filter((s) => s.group_key === group).map((s) => s.sort_order));
    const { error } = await supabase.from("skills").insert({
      group_key: group,
      label_fa: fa.trim() || en.trim(),
      label_en: en.trim() || fa.trim(),
      sort_order: maxOrder + 1,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setFa("");
    setEn("");
    toast.success("مهارت اضافه شد");
    refresh();
  }

  async function remove(s: Skill) {
    const { error } = await supabase.from("skills").delete().eq("id", s.id);
    if (error) { toast.error(error.message); return; }
    toast.success("مهارت حذف شد");
    refresh();
  }

  return (
    <Section title="🛠️ مهارت‌ها" description="هر مهارت را با نام فارسی و انگلیسی اضافه کنید. اگر یکی را خالی بگذارید، همان دیگری نمایش داده می‌شود.">
      <form onSubmit={add} className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGroup(g.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                group === g.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-border",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TextField label="نام مهارت (فارسی)" value={fa} onChange={setFa} placeholder="مثلا: طراحی وایرفریم" />
          <TextField label="نام مهارت (انگلیسی)" value={en} onChange={setEn} placeholder="e.g. Wireframing" ltr />
        </div>
        <Button type="submit" size="pill" disabled={busy}>
          <Plus />
          افزودن مهارت
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {GROUPS.map((g) => {
          const items = skills.filter((s) => s.group_key === g.key);
          return (
            <div key={g.key} className="rounded-2xl border border-border bg-card p-4">
              <h3 className={cn("mb-3 border-b border-border pb-2 text-xs font-bold", g.tone)}>{g.label}</h3>
              {items.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">مهارتی ثبت نشده.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {items.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium"
                      title={`${s.label_fa} / ${s.label_en}`}
                    >
                      {s.label_fa}
                      {s.label_en !== s.label_fa && <span className="text-[10px] text-subtle">({s.label_en})</span>}
                      <button
                        type="button"
                        onClick={() => remove(s)}
                        className="text-subtle hover:text-destructive"
                        aria-label={`حذف ${s.label_fa}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
