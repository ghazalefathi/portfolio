import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectImage = Database["public"]["Tables"]["project_images"]["Row"];
export type Skill = Database["public"]["Tables"]["skills"]["Row"];

const BUCKET = "portfolio";
// Images live in a private bucket; links are signed for 20 years so the public site can show them.
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 365 * 20;

export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("فقط فایل تصویری قابل آپلود است");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${crypto.randomUUID()}.${ext || "jpg"}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);
  if (signError || !data) throw new Error(signError?.message ?? "Upload failed");
  return data.signedUrl;
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const adminSettingsQuery = () =>
  queryOptions({
    queryKey: ["admin", "settings"],
    queryFn: async () =>
      unwrap(await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()),
  });

export const adminProjectsQuery = () =>
  queryOptions({
    queryKey: ["admin", "projects"],
    queryFn: async () =>
      unwrap(
        await supabase.from("projects").select("*").order("sort_order").order("created_at"),
      ) ?? [],
  });

export const adminProjectQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "project", id],
    queryFn: async () => {
      const project = unwrap(await supabase.from("projects").select("*").eq("id", id).maybeSingle());
      const images =
        unwrap(
          await supabase
            .from("project_images")
            .select("*")
            .eq("project_id", id)
            .order("sort_order")
            .order("created_at"),
        ) ?? [];
      return { project, images };
    },
  });

export const adminSkillsQuery = () =>
  queryOptions({
    queryKey: ["admin", "skills"],
    queryFn: async () =>
      unwrap(await supabase.from("skills").select("*").order("sort_order").order("created_at")) ??
      [],
  });

export { unwrap };
