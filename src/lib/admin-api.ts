import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/my-supabase";
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

export async function uploadVideo(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("video/")) throw new Error("فقط فایل ویدیویی قابل آپلود است");
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${crypto.randomUUID()}.${ext || "mp4"}`;
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

/** Swap two items of an array (returns a new array). */
export function swapItems<T>(list: T[], a: number, b: number): T[] {
  const next = [...list];
  const tmp = next[a] as T;
  next[a] = next[b] as T;
  next[b] = tmp;
  return next;
}

export const adminSettingsQuery = () =>
  queryOptions({
    queryKey: ["admin", "settings"],
    queryFn: async (): Promise<SiteSettings | null> => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const adminProjectsQuery = () =>
  queryOptions({
    queryKey: ["admin", "projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order")
        .order("created_at");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const adminProjectQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "project", id],
    queryFn: async (): Promise<{ project: Project | null; images: ProjectImage[] }> => {
      const [project, images] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("project_images")
          .select("*")
          .eq("project_id", id)
          .order("sort_order")
          .order("created_at"),
      ]);
      if (project.error) throw new Error(project.error.message);
      if (images.error) throw new Error(images.error.message);
      return { project: project.data, images: images.data ?? [] };
    },
  });

export const adminSkillsQuery = () =>
  queryOptions({
    queryKey: ["admin", "skills"],
    queryFn: async (): Promise<Skill[]> => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("sort_order")
        .order("created_at");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
