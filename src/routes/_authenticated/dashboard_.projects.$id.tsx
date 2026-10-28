import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, ExternalLink, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/my-supabase";
import { adminProjectQuery, type Project } from "@/lib/admin-api";
import { PROJECT_CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { BiField, ImageField, Section, TextField, VideoField } from "@/components/admin/fields";
import { ProjectImages } from "@/components/admin/ProjectImages";

export const Route = createFileRoute("/_authenticated/dashboard_/projects/$id")({
  loader: async ({ context, params }) => {
    if (params.id === "new") return;
    const data = await context.queryClient.ensureQueryData(adminProjectQuery(params.id));
    if (!data.project) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "ویرایش پروژه | Ghazaleh Fathi Portfolio" },
      { name: "description", content: "Edit a portfolio project, its text and gallery images." },
      { property: "og:title", content: "Edit Project | Ghazaleh Fathi Portfolio" },
      { property: "og:description", content: "Private project editor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProjectEditorPage,
});

type Editable = Omit<Project, "id" | "created_at" | "updated_at" | "sort_order">;

const BLANK: Editable = {
  title_fa: "", title_en: "", desc_fa: "", desc_en: "", features_fa: "", features_en: "",
  implementation_fa: "", implementation_en: "", tag_fa: "", tag_en: "", tech: "Flutter & Dart",
  category: "mobile", link_url: "", release_url: "", video_url: "", cover_url: "", published: true,
};

function ProjectEditorPage() {
  const { id } = Route.useParams();
  return (
    <div dir="rtl" className="font-fa flex justify-center p-4 pb-20 md:p-8">
      <div className="panel w-full max-w-4xl space-y-6 p-5 md:p-10">
        <AdminHeader
          title={id === "new" ? "➕ پروژه جدید" : "✏️ ویرایش پروژه"}
          subtitle="متن‌ها را به فارسی و انگلیسی وارد کنید؛ اگر یکی خالی باشد، دیگری نمایش داده می‌شود"
        />
        <Link
          to="/dashboard"
          search={{ tab: "projects" }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          بازگشت به لیست پروژه‌ها
        </Link>
        {id === "new" ? <NewProject /> : <EditProject id={id} />}
      </div>
    </div>
  );
}

function NewProject() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function create(values: Editable) {
    const { data: last } = await supabase
      .from("projects")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...values, sort_order: (last?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
    toast.success("پروژه ساخته شد — حالا عکس‌های گالری را اضافه کنید");
    navigate({ to: "/dashboard/projects/$id", params: { id: data.id }, replace: true });
  }

  return (
    <>
      <ProjectForm initial={BLANK} onSubmit={create} submitLabel="ساخت پروژه" />
      <p className="rounded-2xl bg-info-soft p-4 text-center text-xs text-info-strong">
        بعد از ساخت پروژه می‌توانید عکس‌های گالری و تصاویر تکمیلی را اضافه کنید.
      </p>
    </>
  );
}

function EditProject({ id }: { id: string }) {
  const { data } = useSuspenseQuery(adminProjectQuery(id));
  const qc = useQueryClient();
  const project = data.project!;
  const { id: _id, created_at: _c, updated_at: _u, sort_order: _s, ...initial } = project;

  async function update(values: Editable) {
    const { error } = await supabase.from("projects").update(values).eq("id", id);
    if (error) throw new Error(error.message);
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
    toast.success("تغییرات پروژه ذخیره شد");
  }

  return (
    <div className="space-y-6">
      {project.published && (
        <Link
          to="/projects/$id"
          params={{ id }}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-info hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          مشاهده این پروژه در سایت
        </Link>
      )}
      <ProjectForm key={id} initial={initial} onSubmit={update} submitLabel="ذخیره تغییرات پروژه" />
      <ProjectImages
        projectId={id}
        kind="gallery"
        images={data.images}
        title="🖼️ گالری تصاویر (اسلایدر)"
        description="این عکس‌ها در اسلایدر صفحه پروژه نمایش داده می‌شوند. می‌توانید چند عکس را هم‌زمان انتخاب کنید."
      />
      <ProjectImages
        projectId={id}
        kind="extra"
        images={data.images}
        title="📎 تصاویر تکمیلی"
        description="تصاویر بزرگ و تمام‌عرض که پایین صفحه پروژه نمایش داده می‌شوند (اختیاری)."
      />
    </div>
  );
}

function ProjectForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial: Editable;
  onSubmit: (v: Editable) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<Editable>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Editable>(key: K) => (v: Editable[K]) => setForm((f) => ({ ...f, [key]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ذخیره نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="📝 اطلاعات پروژه">
        <BiField label="عنوان پروژه" fa={form.title_fa} en={form.title_en} onFa={set("title_fa")} onEn={set("title_en")} required />
        <BiField label="توضیح کوتاه" fa={form.desc_fa} en={form.desc_en} onFa={set("desc_fa")} onEn={set("desc_en")} multiline rows={3} />
        <BiField label="برچسب روی کارت" fa={form.tag_fa} en={form.tag_en} onFa={set("tag_fa")} onEn={set("tag_en")} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TextField label="تکنولوژی‌ها" value={form.tech} onChange={set("tech")} ltr placeholder="Flutter & Dart" />
          <label className="block space-y-1">
            <span className="text-xs font-bold text-subtle-foreground">دسته‌بندی</span>
            <select value={form.category} onChange={(e) => set("category")(e.target.value)} className="field">
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.fa}
                </option>
              ))}
            </select>
          </label>
        </div>
        <TextField
          label="لینک فیگما (Figma Link)"
          value={form.link_url}
          onChange={set("link_url")}
          ltr
          type="url"
          placeholder="https://figma.com/..."
        />
        <TextField
          label="لینک انتشار اپ (اختیاری - پلی‌استور، بازار و...)"
          value={(form as any).release_url || ""}
          onChange={set("release_url" as any)}
          ltr
          type="url"
          placeholder="https://play.google.com/..."
        />
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
          <div>
            <p className="text-xs font-bold">نمایش در سایت</p>
            <p className="text-[11px] text-muted-foreground">اگر خاموش باشد، پروژه فقط در داشبورد دیده می‌شود</p>
          </div>
          <Switch dir="ltr" checked={form.published} onCheckedChange={set("published")} />
        </div>
      </Section>

      <Section title="🖼️ تصویر کاور" description="این عکس روی کارت پروژه در صفحه اصلی و بالای صفحه جزئیات نمایش داده می‌شود.">
        <ImageField label="کاور پروژه" value={form.cover_url} onChange={set("cover_url")} folder="covers" />
      </Section>

      <Section title="🎥 ویدیوی پروژه" description="ویدیو دموی معرفی اپلیکیشن (اختیاری)">
        <VideoField label="ویدیو پروژه" value={(form as any).video_url || ""} onChange={set("video_url" as any)} folder="videos" />
      </Section>

      <Section title="📖 توضیحات صفحه جزئیات">
        <BiField label="ویژگی‌های کلیدی" fa={form.features_fa} en={form.features_en} onFa={set("features_fa")} onEn={set("features_en")} multiline rows={4} />
        <BiField
          label="پیاده‌سازی و ساختار"
          fa={form.implementation_fa}
          en={form.implementation_en}
          onFa={set("implementation_fa")}
          onEn={set("implementation_en")}
          multiline
          rows={4}
        />
      </Section>

      <Button type="submit" size="pill-lg" className="w-full" disabled={saving}>
        {saving ? <Loader2 className="animate-spin" /> : <Save />}
        {submitLabel}
      </Button>
    </form>
  );
}
