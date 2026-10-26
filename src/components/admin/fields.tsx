import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("tile space-y-5 rounded-3xl p-5 md:p-6", className)}>
      <div className="border-b border-border pb-3">
        <h2 className="text-sm font-bold text-foreground md:text-base">{title}</h2>
        {description && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  ltr,
  multiline,
  rows = 3,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ltr?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-bold text-subtle-foreground">{label}</span>
      {multiline ? (
        <textarea
          dir={ltr ? "ltr" : "rtl"}
          rows={rows}
          value={value}
          placeholder={placeholder}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        />
      ) : (
        <input
          dir={ltr ? "ltr" : "rtl"}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        />
      )}
    </label>
  );
}

/** A Persian + English pair of inputs side by side. */
export function BiField({
  label,
  fa,
  en,
  onFa,
  onEn,
  multiline,
  rows,
  required,
}: {
  label: string;
  fa: string;
  en: string;
  onFa: (v: string) => void;
  onEn: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <TextField label={`${label} (فارسی)`} value={fa} onChange={onFa} multiline={multiline} rows={rows} required={required} />
      <TextField label={`${label} (انگلیسی)`} value={en} onChange={onEn} multiline={multiline} rows={rows} ltr />
    </div>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  folder,
  round,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  round?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      toast.success("تصویر آپلود شد — برای ثبت نهایی «ذخیره» را بزنید");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "آپلود ناموفق بود");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-subtle-foreground">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden border border-border bg-secondary",
            round ? "h-16 w-16 rounded-full" : "h-20 w-32 rounded-2xl",
          )}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-subtle" />
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {value ? "تغییر تصویر" : "آپلود تصویر"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 rounded-full bg-destructive-soft px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3.5 w-3.5" />
              حذف
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
