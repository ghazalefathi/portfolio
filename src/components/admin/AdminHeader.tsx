import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-lg font-black text-foreground md:text-xl">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button asChild size="pill" variant="success">
          <Link to="/" target="_blank">
            <Eye />
            مشاهده سایت
          </Link>
        </Button>
        <Button size="pill" variant="secondary" onClick={signOut}>
          <LogOut />
          خروج
        </Button>
      </div>
    </div>
  );
}
