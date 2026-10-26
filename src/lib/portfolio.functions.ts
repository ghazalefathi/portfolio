import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/** Read-only client for public portfolio content (RLS: published rows only). */
function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [settings, projects, skills] = await Promise.all([
    sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    sb
      .from("projects")
      .select("id,title_fa,title_en,desc_fa,desc_en,tag_fa,tag_en,tech,category,cover_url,sort_order")
      .order("sort_order")
      .order("created_at"),
    sb.from("skills").select("*").order("sort_order").order("created_at"),
  ]);
  if (settings.error) throw new Error(settings.error.message);
  if (projects.error) throw new Error(projects.error.message);
  if (skills.error) throw new Error(skills.error.message);
  return { settings: settings.data, projects: projects.data ?? [], skills: skills.data ?? [] };
});

export const getProjectDetail = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [project, images, settings] = await Promise.all([
      sb.from("projects").select("*").eq("id", data.id).maybeSingle(),
      sb.from("project_images").select("*").eq("project_id", data.id).order("sort_order").order("created_at"),
      sb.from("site_settings").select("name_fa,name_en").eq("id", 1).maybeSingle(),
    ]);
    if (project.error) throw new Error(project.error.message);
    if (images.error) throw new Error(images.error.message);
    return {
      project: project.data,
      images: images.data ?? [],
      owner: settings.data ?? { name_fa: "", name_en: "" },
    };
  });

export const getAdminExists = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.rpc("admin_exists");
  if (error) throw new Error(error.message);
  return { exists: Boolean(data) };
});
