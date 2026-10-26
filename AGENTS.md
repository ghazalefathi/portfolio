## Project rules
- All portfolio content (site settings single row id=1, projects, project_images, skills) lives in Lovable Cloud tables; every text field has `_fa` and `_en` columns, rendered via `pickLang` fallback. Why: admin edits everything bilingually from the dashboard.
- Public pages read through `createServerFn` with a publishable-key client (`src/lib/portfolio.functions.ts`); RLS limits anon to published rows. Why: SSR-safe reads without the browser session client.
- Admin access = `user_roles` row with role `admin`; the first auth user ever created gets it via trigger. All writes are gated by `has_role` RLS. Why: credentials live in Cloud Auth and can be changed from the dashboard.
- Images go to the private `portfolio` storage bucket (public buckets are blocked in this workspace) and are stored as long-lived signed URLs. Why: public site can render them without auth.
- Admin UI is Persian-only and forces `dir="rtl"`; `/dashboard` lives under `_authenticated` (client-only gate redirecting to `/admin`).
