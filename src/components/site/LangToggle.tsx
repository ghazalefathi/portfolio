import { Globe } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle({ variant = "dark" }: { variant?: "dark" | "soft" }) {
  const { isFa, toggle } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFa ? "Switch to English" : "تغییر به فارسی"}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold shadow-sm transition-all",
        variant === "dark"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-secondary text-foreground hover:bg-border",
      )}
    >
      <span className="font-en">{isFa ? "EN" : "FA"}</span>
      <Globe className="h-3.5 w-3.5" />
    </button>
  );
}
