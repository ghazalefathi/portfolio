import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowDown, BadgeCheck, CheckCircle2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import { portfolioQuery } from "@/lib/portfolio-queries";
import { useLang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/categories";
import { LangToggle } from "@/components/site/LangToggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery()),
  head: () => ({
    meta: [
      { title: "Ghazaleh Fathi | Flutter Developer Portfolio" },
      {
        name: "description",
        content:
          "Portfolio of Ghazaleh Fathi — Flutter developer with 3 years of mobile app experience and a growing UI/UX design practice.",
      },
      { property: "og:title", content: "Ghazaleh Fathi | Flutter Developer Portfolio" },
      {
        property: "og:description",
        content: "Selected Flutter mobile app projects, skills and contact details of Ghazaleh Fathi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = [
  { id: "about", fa: "درباره من", en: "About Me" },
  { id: "works", fa: "نمونه کارها", en: "Works" },
  { id: "skills", fa: "مهارت‌ها", en: "Skills" },
  { id: "contact", fa: "تماس", en: "Contact" },
] as const;

function Index() {
  const { data } = useSuspenseQuery(portfolioQuery());
  const { t, isFa } = useLang();
  const s = data.settings;
  const [activeNav, setActiveNav] = useState<string>("about");
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(
    () => Array.from(new Set(data.projects.map((p) => p.category))),
    [data.projects],
  );
  const projects = data.projects.filter((p) => filter === "all" || p.category === filter);
  const devSkills = data.skills.filter((k) => k.group_key === "dev");
  const designSkills = data.skills.filter((k) => k.group_key === "design");
  const name = t(s?.name_fa, s?.name_en);

  return (
    <div className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <header className="glass-bar sticky top-4 z-50 flex items-center justify-between rounded-full px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-sm font-bold text-foreground md:text-base">{name}</span>
            </div>
            {s?.show_status && (
              <div className="flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success-strong">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span>{t(s.status_fa, s.status_en)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 rounded-full bg-secondary p-1 text-xs font-medium text-muted-foreground md:flex">
              {NAV.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={() => setActiveNav(n.id)}
                  className={cn(
                    "rounded-full px-4 py-1.5 transition-all",
                    activeNav === n.id
                      ? "bg-card font-semibold text-foreground shadow-sm"
                      : "hover:text-foreground",
                  )}
                >
                  {isFa ? n.fa : n.en}
                </a>
              ))}
            </nav>
            <LangToggle />
          </div>
        </header>

        {/* Hero */}
        <main id="about" className="panel relative scroll-mt-24 overflow-hidden p-8 md:p-12">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {s?.avatar_url ? (
                  <img
                    src={s.avatar_url}
                    alt={name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-border md:h-14 md:w-14"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-secondary ring-2 ring-border md:h-14 md:w-14" />
                )}
                <span className="absolute bottom-0 start-0 rounded-full bg-card text-verified">
                  <BadgeCheck className="h-4 w-4 fill-verified text-card" />
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight text-foreground md:text-lg">{name}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
                  {t(s?.role_fa, s?.role_en)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {t(s?.badge1_fa, s?.badge1_en) && (
                <div className="flex items-center gap-1.5 rounded-full border border-info-muted bg-info-soft px-3.5 py-1.5 text-xs font-medium text-info-strong">
                  <CheckCircle2 className="h-3.5 w-3.5 text-info" />
                  <span>{t(s?.badge1_fa, s?.badge1_en)}</span>
                </div>
              )}
              {t(s?.badge2_fa, s?.badge2_en) && (
                <div className="flex items-center gap-1.5 rounded-full border border-code-muted bg-code-soft px-3.5 py-1.5 text-xs font-medium text-code-strong">
                  <span className="font-mono font-bold text-code">{"</>"}</span>
                  <span>{t(s?.badge2_fa, s?.badge2_en)}</span>
                </div>
              )}
            </div>
          </div>

          <h1 className="mb-6 text-3xl font-black leading-snug tracking-tight text-foreground md:text-5xl md:leading-tight">
            {t(s?.headline_fa, s?.headline_en)}
          </h1>
          <p className="mb-8 whitespace-pre-line text-sm leading-relaxed text-subtle-foreground md:text-base md:leading-loose">
            {t(s?.subtext_fa, s?.subtext_en)}
          </p>

          <div className="flex justify-center">
            <a
              href="#works"
              aria-label={isFa ? "مشاهده نمونه کارها" : "See works"}
              className="flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-110 hover:bg-primary/90"
            >
              <ArrowDown className="h-5 w-5" />
            </a>
          </div>
        </main>

        {/* Works */}
        <section id="works" className="panel scroll-mt-24 space-y-6 p-6 md:p-10">
          <div className="flex flex-col justify-between gap-4 border-b border-secondary pb-5 md:flex-row md:items-center">
            <div>
              <h3 className="mb-1 text-xl font-bold text-foreground md:text-2xl">
                {t(s?.works_title_fa, s?.works_title_en)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t(s?.works_subtitle_fa, s?.works_subtitle_en)}
              </p>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
                  {isFa ? "همه" : "All"}
                </FilterButton>
                {categories.map((c) => {
                  const label = categoryLabel(c);
                  return (
                    <FilterButton key={c} active={filter === c} onClick={() => setFilter(c)}>
                      {isFa ? label.fa : label.en}
                    </FilterButton>
                  );
                })}
              </div>
            )}
          </div>

          {projects.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {isFa ? "هنوز پروژه‌ای اضافه نشده است." : "No projects yet."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {projects.map((p) => {
                const title = t(p.title_fa, p.title_en);
                const tag = t(p.tag_fa, p.tag_en) || (isFa ? "پروژه فلاتر" : "Project");
                return (
                  <Link
                    key={p.id}
                    to="/projects/$id"
                    params={{ id: p.id }}
                    className="tile group flex flex-col justify-between rounded-2xl p-3 transition-all hover:border-border hover:shadow-md"
                  >
                    <div>
                      <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-border">
                        {p.cover_url && (
                          <img
                            src={p.cover_url}
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                        <span className="absolute start-2 top-2 rounded-full bg-success/90 px-2.5 py-0.5 text-[10px] font-bold text-success-foreground">
                          {tag}
                        </span>
                      </div>
                      <h4 className="mb-1 line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-info">
                        {title}
                      </h4>
                      <p className="mb-3 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                        {t(p.desc_fa, p.desc_en)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] font-bold text-foreground">
                      <span className="font-mono text-[10px] text-subtle" dir="ltr">
                        {p.tech || "Flutter"}
                      </span>
                      <span className="transition-transform group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
                        {isFa ? "جزئیات ←" : "View →"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Skills */}
        <section id="skills" className="panel scroll-mt-24 space-y-8 p-8 md:p-12">
          <div className="border-b border-secondary pb-6">
            <h3 className="mb-1 text-2xl font-bold text-foreground md:text-3xl">
              {t(s?.skills_title_fa, s?.skills_title_en)}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(s?.skills_subtitle_fa, s?.skills_subtitle_en)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SkillGroup
              icon={<span className="font-mono">{"</>"}</span>}
              iconClass="bg-code-muted text-code-strong"
              title={t(s?.skills_dev_title_fa, s?.skills_dev_title_en)}
              items={devSkills.map((k) => t(k.label_fa, k.label_en))}
            />
            <SkillGroup
              icon={<span>🎨</span>}
              iconClass="bg-design-soft text-design"
              title={t(s?.skills_design_title_fa, s?.skills_design_title_en)}
              items={designSkills.map((k) => t(k.label_fa, k.label_en))}
            />
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="panel scroll-mt-24 space-y-8 p-8 md:p-12">
          <div className="border-b border-secondary pb-6">
            <h3 className="mb-1 text-2xl font-bold text-foreground md:text-3xl">
              {t(s?.contact_title_fa, s?.contact_title_en)}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(s?.contact_subtitle_fa, s?.contact_subtitle_en)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              {s?.email && (
                <ContactRow
                  href={`mailto:${s.email}`}
                  icon={<Mail className="h-4 w-4" />}
                  label={isFa ? "ایمیل مستقیم" : "Email Address"}
                  value={s.email}
                />
              )}
              {s?.phone && (
                <ContactRow
                  href={`tel:${s.phone}`}
                  icon={<Phone className="h-4 w-4" />}
                  label={isFa ? "شماره تماس" : "Phone Number"}
                  value={s.phone}
                />
              )}
            </div>

            <ContactForm email={s?.email ?? ""} />
          </div>
        </section>

        <footer className="pb-4 text-center text-[11px] text-subtle">
          © {name}
        </footer>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-secondary text-muted-foreground hover:bg-border",
      )}
    >
      {children}
    </button>
  );
}

function SkillGroup({
  icon,
  iconClass,
  title,
  items,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="tile rounded-3xl p-6">
      <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-2xl font-bold", iconClass)}>
        {icon}
      </div>
      <h4 className="mb-3 text-base font-bold text-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((label, i) => (
          <span key={i} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContactRow({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a href={href} className="tile flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-secondary">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {icon}
      </div>
      <div>
        <span className="block text-xs text-subtle">{label}</span>
        <span className="text-sm font-bold text-foreground" dir="ltr">
          {value}
        </span>
      </div>
    </a>
  );
}

function ContactForm({ email }: { email: string }) {
  const { isFa } = useLang();
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const subject = encodeURIComponent(isFa ? `پیام از طرف ${name}` : `Message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${from})`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    toast.success(isFa ? "برنامه ایمیل شما باز شد" : "Your email app was opened");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={isFa ? "نام شما" : "Your Name"}
        className="field bg-muted"
      />
      <input
        required
        type="email"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        placeholder={isFa ? "ایمیل شما" : "Your Email"}
        className="field bg-muted"
      />
      <textarea
        required
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isFa ? "متن پیام..." : "Your Message..."}
        className="field bg-muted"
      />
      <button
        type="submit"
        className="w-full rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90"
      >
        {isFa ? "ارسال پیام" : "Send Message"}
      </button>
    </form>
  );
}
