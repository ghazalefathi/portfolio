import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { adminProjectsQuery, adminSettingsQuery, adminSkillsQuery } from "@/lib/admin-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { ProjectsPanel } from "@/components/admin/ProjectsPanel";
import { SkillsPanel } from "@/components/admin/SkillsPanel";
import { AccountPanel } from "@/components/admin/AccountPanel";

const TABS = ["site", "projects", "skills", "account"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: z.object({ tab: z.enum(TABS).optional() }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(adminSettingsQuery()),
      context.queryClient.ensureQueryData(adminProjectsQuery()),
      context.queryClient.ensureQueryData(adminSkillsQuery()),
    ]),
  head: () => ({
    meta: [
      { title: "داشبورد مدیریت | Ghazaleh Fathi Portfolio" },
      { name: "description", content: "Manage portfolio content, projects, images and skills." },
      { property: "og:title", content: "Dashboard | Ghazaleh Fathi Portfolio" },
      { property: "og:description", content: "Private portfolio management dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { tab = "site" } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard" });

  return (
    <div dir="rtl" className="font-fa flex justify-center p-4 pb-20 md:p-8">
      <div className="panel w-full max-w-4xl space-y-6 p-5 md:p-10">
        <AdminHeader
          title="⚙️ داشبورد مدیریت پورتفولیو"
          subtitle="همه متن‌ها، عکس‌ها، پروژه‌ها و مهارت‌های سایت را از اینجا تغییر دهید"
        />

        <Tabs
          dir="rtl"
          value={tab}
          onValueChange={(v) => navigate({ search: { tab: v as Tab }, replace: true })}
          className="space-y-6"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-secondary p-1 sm:grid-cols-4">
            <TabsTrigger value="site" className="rounded-xl py-2 text-xs font-bold">اطلاعات سایت</TabsTrigger>
            <TabsTrigger value="projects" className="rounded-xl py-2 text-xs font-bold">پروژه‌ها</TabsTrigger>
            <TabsTrigger value="skills" className="rounded-xl py-2 text-xs font-bold">مهارت‌ها</TabsTrigger>
            <TabsTrigger value="account" className="rounded-xl py-2 text-xs font-bold">حساب کاربری</TabsTrigger>
          </TabsList>

          <TabsContent value="site">
            <SettingsPanel />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsPanel />
          </TabsContent>
          <TabsContent value="skills">
            <SkillsPanel />
          </TabsContent>
          <TabsContent value="account">
            <AccountPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
