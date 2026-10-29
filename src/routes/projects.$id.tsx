import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { projectDetailQuery } from "@/lib/portfolio-queries";
import { useLang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/projects/$id")({
  loader: async ({ context, params }) => {
    if (!UUID_RE.test(params.id)) throw notFound();
    const data = await context.queryClient.ensureQueryData(projectDetailQuery(params.id));
    if (!data.project) throw notFound();
    return { titleEn: data.project.title_en, descEn: data.project.desc_en, cover: data.project.cover_url };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.titleEn} | Ghazaleh Fathi` : "Project | Ghazaleh Fathi";
    const description = loaderData?.descEn || "Flutter project case study by Ghazaleh Fathi.";
    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (loaderData?.cover?.startsWith("https://")) {
      meta.push({ property: "og:image", content: loaderData.cover });
      meta.push({ name: "twitter:image", content: loaderData.cover });
    }
    return { meta };
  },
  notFoundComponent: ProjectNotFound,
  component: ProjectDetail,
});

function ProjectNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="panel max-w-md p-10 text-center">
        <h1 className="text-xl font-bold">پروژه پیدا نشد</h1>
        <p className="mt-2 text-sm text-muted-foreground">این پروژه حذف شده یا هنوز منتشر نشده است.</p>
        <Link
          to="/"
          hash="works"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground"
        >
          بازگشت به نمونه‌کارها
        </Link>
      </div>
    </div>
  );
}

function ProjectDetail() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(projectDetailQuery(id));
  const { t, isFa } = useLang();
  const p = data.project! as any;
  const gallery = data.images.filter((i) => i.kind === "gallery");
  const extra = data.images.filter((i) => i.kind === "extra");
  const slides = gallery;
  const [active, setActive] = useState(0);
  const current = slides[Math.min(active, Math.max(slides.length - 1, 0))];
  const cat = categoryLabel(p.category);
  const title = t(p.title_fa, p.title_en);

  return (
    <div className="flex min-h-screen justify-center p-4 pb-20 md:p-8">
      <div className="w-full max-w-5xl space-y-6">
        <header className="glass-bar sticky top-4 z-50 flex items-center justify-between rounded-full px-4 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              hash="works"
              className="group flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              <ArrowLeft className="h-3.5 w-3.5 rotate-180 sm:rotate-0" />
              <span className="hidden sm:inline">{isFa ? "بازگشت به نمونه‌کارها" : "Back to Works"}</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-subtle-foreground sm:inline-block">
              {isFa ? "جزئیات پروژه" : "Project Detail"}
            </span>
            <span className="hidden text-border sm:inline">|</span>
            <Link to="/" className="group flex items-center gap-2.5">
              <span className="text-xs font-bold text-foreground transition-colors group-hover:text-info md:text-sm">
                {t(data.owner.name_fa, data.owner.name_en)}
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-primary transition-transform group-hover:scale-125" />
            </Link>
          </div>
        </header>

        <main className="panel space-y-8 p-6 md:p-12 text-left" dir="ltr">
          <div className="space-y-4 border-b border-secondary pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {t(p.tag_fa, p.tag_en) && (
                <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success-strong">
                  {t(p.tag_fa, p.tag_en)}
                </span>
              )}
              {p.tech && (
                <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs text-subtle-foreground" dir="ltr">
                  {p.tech}
                </span>
              )}
              <span className="rounded-full bg-info-soft px-3 py-1 text-xs font-semibold text-info-strong">
                {isFa ? cat.fa : cat.en}
              </span>
            </div>
            <h1 className="text-2xl font-black leading-snug text-foreground md:text-4xl md:leading-tight">{title}</h1>
            <p className="max-w-4xl whitespace-pre-line text-xs leading-relaxed text-subtle-foreground md:text-sm md:leading-loose">
              {t(p.desc_fa, p.desc_en)}
            </p>
          </div>

          {p.cover_url && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-secondary shadow-sm">
              <img src={p.cover_url} alt={title} className="h-full w-full object-contain bg-secondary" />
            </div>
          )}

          {p.video_url && (
            <div className="space-y-2 overflow-hidden rounded-3xl border border-border bg-secondary p-2 shadow-sm">
              <video src={p.video_url} controls className="w-full rounded-2xl shadow-md" />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <InfoTile icon="📱" iconClass="bg-code-soft" label={isFa ? "نوع پروژه" : "Project Type"}>
              {isFa ? cat.fa : cat.en}
            </InfoTile>
            <InfoTile icon="🛠️" iconClass="bg-info-soft" label={isFa ? "تکنولوژی‌ها" : "Technologies"}>
              <span dir="ltr">{p.tech || "Flutter"}</span>
            </InfoTile>
            {p.link_url && (
              <InfoTile icon="🔗" iconClass="bg-success-soft" label={isFa ? "لینک فیگما" : "Figma Link"}>
                <a
                  href={p.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-info hover:underline"
                >
                  {isFa ? "مشاهده لینک فیگما" : "View Figma"}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </InfoTile>
            )}
            {p.release_url && (
              <InfoTile icon="🚀" iconClass="bg-info-soft" label={isFa ? "لینک انتشار اپ" : "App Release Link"}>
                <a
                  href={p.release_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-info hover:underline"
                >
                  {isFa ? "مشاهده اپ منتشرشده" : "View Live App"}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </InfoTile>
            )}
          </div>

          {(t(p.features_fa, p.features_en) || t(p.implementation_fa, p.implementation_en)) && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {t(p.features_fa, p.features_en) && (
                <div className="space-y-2 rounded-3xl border border-info-muted bg-info-soft p-6">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-info-muted text-sm">⚡</div>
                  <h3 className="text-sm font-bold text-foreground">{isFa ? "ویژگی‌های کلیدی" : "Key Features"}</h3>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-subtle-foreground">
                    {t(p.features_fa, p.features_en)}
                  </p>
                </div>
              )}
              {t(p.implementation_fa, p.implementation_en) && (
                <div className="space-y-2 rounded-3xl border border-success-soft bg-success-soft/50 p-6">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-success-soft text-sm">💡</div>
                  <h3 className="text-sm font-bold text-foreground">
                    {isFa ? "پیاده‌سازی و ساختار" : "Implementation & Structure"}
                  </h3>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-subtle-foreground">
                    {t(p.implementation_fa, p.implementation_en)}
                  </p>
                </div>
              )}
            </div>
          )}

          {gallery.length > 0 && current && (
            <div className="space-y-4 border-t border-secondary pt-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">{isFa ? "گالری تصاویر پروژه" : "Project Gallery"}</h3>
                {t(p.gallery_desc_fa, p.gallery_desc_en) && (
                  <p className="whitespace-pre-line text-xs leading-relaxed text-subtle-foreground">
                    {t(p.gallery_desc_fa, p.gallery_desc_en)}
                  </p>
                )}
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-secondary shadow-inner">
                <img
                  src={current.url}
                  alt={t(current.caption_fa, current.caption_en) || title}
                  className="h-full w-full object-contain"
                />
              </div>
              {slides.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {slides.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={t(img.caption_fa, img.caption_en) || `${i + 1}`}
                      className={cn(
                        "h-16 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-card p-1 transition-all md:h-20 md:w-24",
                        i === active
                          ? "border-info ring-2 ring-info-muted"
                          : "border-border opacity-70 hover:opacity-100",
                      )}
                    >
                      <img src={img.url} alt="" className="h-full w-full rounded-xl object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {extra.length > 0 && (
            <div className="space-y-4 border-t border-secondary pt-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">{isFa ? "تصاویر تکمیلی" : "Additional Screens"}</h3>
                {t(p.extra_desc_fa, p.extra_desc_en) && (
                  <p className="whitespace-pre-line text-xs leading-relaxed text-subtle-foreground">
                    {t(p.extra_desc_fa, p.extra_desc_en)}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 justify-items-center gap-6">
                {extra.map((img) => (
                  <figure
                    key={img.id}
                    className="w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-secondary shadow-sm"
                  >
                    <img src={img.url} alt={t(img.caption_fa, img.caption_en) || title} className="h-auto w-full object-cover" />
                  </figure>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-secondary pt-6 text-center">
            <Link
              to="/"
              hash="works"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            >
              {isFa ? "مشاهده سایر نمونه‌کارهای من" : "Explore More Works"}
              <ArrowLeft className="h-3.5 w-3.5 ltr:rotate-180" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  iconClass,
  label,
  children,
}: {
  icon: string;
  iconClass: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="tile flex items-start gap-3.5 rounded-2xl p-4 transition-all hover:border-border md:p-5">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg", iconClass)}>
        {icon}
      </div>
      <div>
        <span className="mb-0.5 block text-[11px] font-semibold text-subtle">{label}</span>
        <strong className="block text-xs font-bold leading-snug text-foreground md:text-sm">{children}</strong>
      </div>
    </div>
  );
}
