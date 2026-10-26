-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

-- First account ever created becomes the admin
CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(424242);
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_assign_admin
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Site settings (single row)
CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name_fa text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  role_fa text NOT NULL DEFAULT '',
  role_en text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  show_status boolean NOT NULL DEFAULT true,
  status_fa text NOT NULL DEFAULT '',
  status_en text NOT NULL DEFAULT '',
  badge1_fa text NOT NULL DEFAULT '',
  badge1_en text NOT NULL DEFAULT '',
  badge2_fa text NOT NULL DEFAULT '',
  badge2_en text NOT NULL DEFAULT '',
  headline_fa text NOT NULL DEFAULT '',
  headline_en text NOT NULL DEFAULT '',
  subtext_fa text NOT NULL DEFAULT '',
  subtext_en text NOT NULL DEFAULT '',
  works_title_fa text NOT NULL DEFAULT '',
  works_title_en text NOT NULL DEFAULT '',
  works_subtitle_fa text NOT NULL DEFAULT '',
  works_subtitle_en text NOT NULL DEFAULT '',
  skills_title_fa text NOT NULL DEFAULT '',
  skills_title_en text NOT NULL DEFAULT '',
  skills_subtitle_fa text NOT NULL DEFAULT '',
  skills_subtitle_en text NOT NULL DEFAULT '',
  skills_dev_title_fa text NOT NULL DEFAULT '',
  skills_dev_title_en text NOT NULL DEFAULT '',
  skills_design_title_fa text NOT NULL DEFAULT '',
  skills_design_title_en text NOT NULL DEFAULT '',
  contact_title_fa text NOT NULL DEFAULT '',
  contact_title_en text NOT NULL DEFAULT '',
  contact_subtitle_fa text NOT NULL DEFAULT '',
  contact_subtitle_en text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_touch BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fa text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  desc_fa text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  features_fa text NOT NULL DEFAULT '',
  features_en text NOT NULL DEFAULT '',
  implementation_fa text NOT NULL DEFAULT '',
  implementation_en text NOT NULL DEFAULT '',
  tag_fa text NOT NULL DEFAULT '',
  tag_en text NOT NULL DEFAULT '',
  tech text NOT NULL DEFAULT 'Flutter',
  category text NOT NULL DEFAULT 'mobile',
  link_url text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published projects" ON public.projects FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read all projects" ON public.projects FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Project images
CREATE TABLE public.project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption_fa text NOT NULL DEFAULT '',
  caption_en text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'gallery' CHECK (kind IN ('gallery', 'extra')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_images_project_idx ON public.project_images(project_id, sort_order);
GRANT SELECT ON public.project_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_images TO authenticated;
GRANT ALL ON public.project_images TO service_role;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads images of published projects" ON public.project_images FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.published = true));
CREATE POLICY "Admins read all images" ON public.project_images FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert images" ON public.project_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update images" ON public.project_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete images" ON public.project_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Skills
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key text NOT NULL DEFAULT 'dev' CHECK (group_key IN ('dev', 'design')),
  label_fa text NOT NULL DEFAULT '',
  label_en text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads skills" ON public.skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update skills" ON public.skills FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete skills" ON public.skills FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for the portfolio bucket
CREATE POLICY "Admins upload portfolio files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update portfolio files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete portfolio files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));

-- Seed content
INSERT INTO public.site_settings (
  id, name_fa, name_en, role_fa, role_en, avatar_url, show_status, status_fa, status_en,
  badge1_fa, badge1_en, badge2_fa, badge2_en, headline_fa, headline_en, subtext_fa, subtext_en,
  works_title_fa, works_title_en, works_subtitle_fa, works_subtitle_en,
  skills_title_fa, skills_title_en, skills_subtitle_fa, skills_subtitle_en,
  skills_dev_title_fa, skills_dev_title_en, skills_design_title_fa, skills_design_title_en,
  contact_title_fa, contact_title_en, contact_subtitle_fa, contact_subtitle_en, email, phone
) VALUES (
  1, 'غزاله فتحی', 'Ghazaleh Fathi', 'توسعه‌دهنده Flutter', 'Flutter Developer',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', true,
  'آماده به‌کار', 'Available',
  '۳ سال سابقه توسعه با Flutter', '3 Years of Flutter Development',
  'کمتر از ۱ سال سابقه طراحی UI/UX', '< 1 Year UI/UX Experience',
  'سلام، من غزاله‌ام؛ توسعه‌دهنده اپلیکیشن با Flutter', 'Hi, I''m Ghazaleh — a Flutter Developer',
  'من توسعه‌دهنده Flutter هستم و ۳ سال سابقه تخصصی در ساخت و توسعه اپلیکیشن‌های موبایل دارم. در کنار برنامه‌نویسی، کمتر از ۱ سال نیز سابقه فعالیت در زمینه طراحی UI/UX دارم که به من در درک بهتر و پیاده‌سازی دقیق‌تر رابط‌های کاربری کمک می‌کند.',
  'I am a Flutter developer with 3 years of experience building mobile applications. Alongside my core development skills, I also have less than a year of experience in UI/UX design, helping me better understand and implement design interfaces.',
  'پروژه‌های Flutter', 'Flutter Projects', 'نمونه‌هایی از پروژه‌های اپلیکیشن موبایل', 'Selected mobile application projects',
  'مهارت‌ها و تخصص‌ها', 'Skills & Expertise',
  'تمرکز اصلی من توسعه فلاتر است، در کنار آن مهارت‌های پایه طراحی را نیز دارم', 'My core focus is Flutter development, complemented by basic UI/UX design skills',
  'توسعه Flutter و Dart (۳ سال سابقه)', 'Flutter & Dart Development (3 Years)',
  'طراحی رابط و تجربه کاربری (< ۱ سال سابقه)', 'UI/UX Design (< 1 Year)',
  'ارتباط با من', 'Get In Touch', 'آماده همکاری در پروژه‌های جذاب و تیم‌های حرفه‌ای', 'Let''s build something great together for your team',
  'ghazalehfathi20@gmail.com', '09055400525'
);

INSERT INTO public.projects (id, sort_order, title_fa, title_en, desc_fa, desc_en, features_fa, features_en, implementation_fa, implementation_en, tag_fa, tag_en, tech, category, link_url, cover_url) VALUES
('a1000000-0000-4000-8000-000000000001', 1, 'Skybook - رزرو پرواز', 'Skybook - Flight App',
 'نمونه پروژه اپلیکیشن رزرو پرواز Skybook توسعه داده شده با فلاتر.', 'Skybook flight-booking app project built with Flutter.',
 'نمایش اطلاعات پرواز، ورود اطلاعات مسافر و بازبینی سفارش پیش از پرداخت با معماری استاندارد.', 'Flight information display, passenger details input, and order review prior to payment.',
 'صفحه پشتیبانی مشتریان نیز به‌عنوان بخشی از تجربه کاربری اپلیکیشن پیاده‌سازی شده است.', 'Customer support screen implemented as part of the application user experience.',
 'پروژه Skybook', 'Skybook Project', 'Flutter & Dart', 'mobile',
 'https://www.figma.com/design/RqGK2oZ10sXQCxHPZRPnZE/Skybook-App?node-id=485-5827&t=rR1TMlvMgEMrrjra-1',
 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200'),
('a1000000-0000-4000-8000-000000000002', 2, 'Stat Counter Pro - شمارشگر امتیاز پدل', 'Stat Counter Pro - Padel Score Counter',
 'اپلیکیشن موبایل برای شمارش امتیاز و مدیریت مسابقات پدل و ورزش‌های مختلف.', 'Mobile app for Padel and sports score tracking.',
 'طراحی و توسعه رابط کاربری روان برای شمارش امتیاز مسابقات ورزشی با دسترسی سریع.', 'Smooth UI development for sports match score tracking with quick access controls.',
 'استفاده از تم مدرن، دکمه‌های لمسی دقیق برای افزایش و کاهش امتیاز.', 'Modern theme implementation with precise touch buttons for score adjustments.',
 'اپلیکیشن موبایل', 'Mobile App', 'Flutter & Dart', 'mobile', '',
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200'),
('a1000000-0000-4000-8000-000000000003', 3, 'Mellow Store - فروشگاه آنلاین', 'Mellow Store - E-Commerce',
 'توسعه اپلیکیشن فروشگاهی با فلاتر و مدیریت سبد خرید.', 'E-Commerce mobile application built with Flutter and cart management.',
 'پیاده‌سازی کاتالوگ محصولات، فیلتر دسته‌بندی‌ها و سبد خرید پویا.', 'Product catalog implementation, category filtering, and dynamic shopping cart.',
 'اتصال به API و مدیریت وضعیت داده‌ها با پکیج‌های بهینه.', 'API integration and state management using optimized packages.',
 'اپلیکیشن موبایل', 'Mobile App', 'Flutter', 'mobile', '',
 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200'),
('a1000000-0000-4000-8000-000000000004', 4, 'Magnum Ice Cream - کانسپت تعاملی', 'Magnum Ice Cream - Interactive Concept',
 'پیاده‌سازی رابط کاربری تعاملی سری بدون قند مگنوم با فلاتر.', 'Interactive UI implementation for Sugar-Free series with Flutter.',
 'پیاده‌سازی انیمیشن‌های نرم و لایه‌های گرافیکی جذاب.', 'Implementing smooth animations and appealing graphic layers.',
 'استفاده از قابلیت‌های پیشرفته انیمیشن در فلاتر.', 'Leveraging advanced Flutter animation capabilities.',
 'رابط کاربری', 'UI Implementation', 'Flutter', 'mobile', '',
 'https://images.unsplash.com/photo-1560008511-11c63416e52d?auto=format&fit=crop&q=80&w=1200'),
('a1000000-0000-4000-8000-000000000005', 5, 'FixNest - رزرو خدمات منزل', 'FixNest - Home Service Booking',
 'اپلیکیشن درخواست و رزرو خدمات منزل و فنی.', 'Home Service Booking App.',
 'انتخاب خدمات فنی، تعیین زمان و آدرس به صورت فرم چندمرحله‌ای.', 'Selecting technical services, scheduling time and address in multi-step forms.',
 'طراحی فرم‌های تعاملی و ساختار یافته.', 'Designing interactive and structured forms.',
 'اپلیکیشن موبایل', 'Mobile App', 'Flutter', 'mobile', '',
 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200'),
('a1000000-0000-4000-8000-000000000006', 6, 'FitTrack - تناسب اندام و آب', 'FitTrack - Fitness & Water Tracker',
 'اپلیکیشن پیگیری تناسب اندام، تمرینات و مصرف آب.', 'Fitness, Workout & Water Tracker App.',
 'محاسبه کالری روزانه، نمایش نمودارهای پیشرفت و ثبت مصرف آب.', 'Daily calorie calculation, progress chart visualization, and water intake logging.',
 'استفاده از پکیج‌های رسم نمودار و ذخیره محلی داده‌ها.', 'Using chart rendering packages and local data caching.',
 'سلامتی', 'Fitness App', 'Flutter & Dart', 'mobile', '',
 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200');

INSERT INTO public.project_images (project_id, url, caption_fa, caption_en, kind, sort_order) VALUES
('a1000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1200', 'اطلاعات مسافر', 'Passenger Details', 'gallery', 1),
('a1000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&q=80&w=1200', 'بازبینی و پرداخت', 'Checkout & Review', 'gallery', 2),
('a1000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1200', 'پشتیبانی مشتریان', 'Customer Support', 'extra', 1),
('a1000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200', 'نمای امتیازدهی مسابقه', 'Match Scoring View', 'gallery', 1),
('a1000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200', 'تنظیمات و انتخاب ورزش', 'Settings & Sport Selection', 'gallery', 2),
('a1000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200', 'صفحه محصولات', 'Products Page', 'gallery', 1),
('a1000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1560008511-11c63416e52d?auto=format&fit=crop&q=80&w=1200', 'نمای محصول', 'Product View', 'gallery', 1),
('a1000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200', 'لیست خدمات', 'Services List', 'gallery', 1),
('a1000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200', 'داشبورد تناسب اندام', 'Fitness Dashboard', 'gallery', 1);

INSERT INTO public.skills (group_key, label_fa, label_en, sort_order) VALUES
('dev', 'Flutter', 'Flutter', 1),
('dev', 'Dart', 'Dart', 2),
('dev', 'State Management (Provider / GetX / Bloc)', 'State Management (Provider / GetX / Bloc)', 3),
('dev', 'REST API Integration', 'REST API Integration', 4),
('dev', 'Responsive UI', 'Responsive UI', 5),
('dev', 'Git & GitHub', 'Git & GitHub', 6),
('design', 'Figma (مقدماتی)', 'Figma (Basic)', 1),
('design', 'طراحی وایرفریم', 'Wireframing', 2),
('design', 'طراحی رابط کاربری موبایل', 'Mobile UI Design', 3);