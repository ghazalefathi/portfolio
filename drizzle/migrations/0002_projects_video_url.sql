ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '';
