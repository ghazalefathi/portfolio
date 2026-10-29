ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS release_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gallery_desc_fa text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gallery_desc_en text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS extra_desc_fa text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS extra_desc_en text NOT NULL DEFAULT '';
