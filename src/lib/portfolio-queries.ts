import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/my-supabase";

export const portfolioQuery = () =>
  queryOptions({
    queryKey: ["portfolio", "home"],
    queryFn: async () => {
      const [settings, projects, skills] = await Promise.all([
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase
          .from("projects")
          .select("id,title_fa,title_en,desc_fa,desc_en,tag_fa,tag_en,tech,category,cover_url,sort_order")
          .order("sort_order")
          .order("created_at"),
        supabase.from("skills").select("*").order("sort_order").order("created_at"),
      ]);
      if (settings.error) throw new Error(settings.error.message);
      if (projects.error) throw new Error(projects.error.message);
      if (skills.error) throw new Error(skills.error.message);
      return { settings: settings.data, projects: projects.data ?? [], skills: skills.data ?? [] };
    },
  });

export const projectDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["portfolio", "project", id],
    queryFn: async () => {
      const [project, images, settings] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).maybeSingle(),
        supabase.from("project_images").select("*").eq("project_id", id).order("sort_order").order("created_at"),
        supabase.from("site_settings").select("name_fa,name_en").eq("id", 1).maybeSingle(),
      ]);
      if (project.error) throw new Error(project.error.message);
      if (images.error) throw new Error(images.error.message);
      return {
        project: project.data,
        images: images.data ?? [],
        owner: settings.data ?? { name_fa: "", name_en: "" },
      };
    },
  });

export const adminExistsQuery = () =>
  queryOptions({
    queryKey: ["admin-exists"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_exists");
      if (error) throw new Error(error.message);
      return { exists: Boolean(data) };
    },
  });
