import { Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { adminProjectsQuery, swapItems, type Project } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Section } from "./fields";

export function ProjectsPanel() {
  const { data: projects } = useSuspenseQuery(adminProjectsQuery());
  const qc = useQueryClient();

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  async function togglePublished(p: Project, published: boolean) {
    const { error } = await supabase.from("projects").update({ published }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(published ? "پروژه در سایت نمایش داده می‌شود" : "پروژه از سایت مخفی شد");
    refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= projects.length) return;
    const reordered = swapItems(projects, index, target);
    const results = await Promise.all(
      reordered.map((p, i) => supabase.from("projects").update({ sort_order: i + 1 }).eq("id", p.id)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) { toast.error(failed.error.message); return; }
    refresh();
  }

  async function remove(p: Project) {
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("پروژه حذف شد");
    refresh();
  }

  return (
    <Section
      title="📁 پروژه‌ها"
      description="ترتیب نمایش را با فلش‌ها تغییر دهید، با کلید نمایش پروژه را مخفی یا منتشر کنید و برای ویرایش متن‌ها و عکس‌ها روی «ویرایش» بزنید."
    >
      <Button asChild size="pill" variant="success" className="w-full sm:w-auto">
        <Link to="/dashboard/projects/$id" params={{ id: "new" }}>
          <Plus />
          افزودن پروژه جدید
        </Link>
      </Button>

      {projects.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">هنوز پروژه‌ای ندارید.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p, i) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {p.cover_url && <img src={p.cover_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">{p.title_fa || p.title_en || "بدون عنوان"}</p>
                  <p className="truncate text-[11px] text-subtle" dir="ltr">
                    {p.title_en} · {p.tech}
                  </p>
                  {!p.published && (
                    <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                      مخفی
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
                  <span className="text-[10px] font-bold text-muted-foreground">نمایش</span>
                  <Switch dir="ltr" checked={p.published} onCheckedChange={(v) => togglePublished(p, v)} />
                </div>
                <Button size="icon-pill" variant="secondary" onClick={() => move(i, -1)} disabled={i === 0} aria-label="بالاتر">
                  <ArrowUp />
                </Button>
                <Button
                  size="icon-pill"
                  variant="secondary"
                  onClick={() => move(i, 1)}
                  disabled={i === projects.length - 1}
                  aria-label="پایین‌تر"
                >
                  <ArrowDown />
                </Button>
                <Button asChild size="pill" variant="secondary">
                  <Link to="/dashboard/projects/$id" params={{ id: p.id }}>
                    <Pencil />
                    ویرایش
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon-pill" variant="destructive-soft" aria-label="حذف">
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl" className="font-fa">
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف «{p.title_fa || p.title_en}»؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        این پروژه و همه عکس‌های گالری آن برای همیشه حذف می‌شوند.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel>انصراف</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(p)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        بله، حذف شود
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
