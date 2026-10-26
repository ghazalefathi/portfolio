export const PROJECT_CATEGORIES = [
  { value: "mobile", fa: "اپلیکیشن موبایل", en: "Mobile App" },
  { value: "web", fa: "وب‌سایت / وب‌اپ", en: "Web App" },
  { value: "design", fa: "طراحی UI/UX", en: "UI/UX Design" },
  { value: "other", fa: "سایر", en: "Other" },
] as const;

export function categoryLabel(value: string) {
  return PROJECT_CATEGORIES.find((c) => c.value === value) ?? { value, fa: value, en: value };
}
