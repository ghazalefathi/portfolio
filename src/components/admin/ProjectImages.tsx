import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/my-supabase";
import { swapItems, uploadImage, type ProjectImage } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Section } from "./fields";

export function ProjectImages({
  projectId,
  kind,
  images,
  title,
  description,
}: {
  projectId: string;
  kind: "gallery" | "extra";
  images: ProjectImage[];
  title: string;
  description: string;
}) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const items = images.filter((i) => i.kind === kind);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "project", projectId] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setUploading(list.length);
    let order = Math.max(0, ...items.map((i) => i.sort_order));
    try {
      for (const file of list) {
        const url = await uploadImage(file, `projects/${projectId}`);
        order += 1;
        const { error } = await supabase
          .from("project_images")
          .insert({ project_id: projectId, url, kind, sort_order: order });
        if (error) throw new Error(error.message);
        setUploading((n) => n - 1);
      }
      toast.success(list.length > 1 ? `${list.length} تصویر اضافه شد` : "تصویر اضافه شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "آپلود ناموفق بود");
    } finally {
      setUploading(0);
      if (inputRef.current) inputRef.current.value = "";
      refresh();
    }
  }

  async function updateCaption(img: ProjectImage, field: "caption_fa" | "caption_en", value: string) {
    if (img[field] === value) return;
    const patch = field === "caption_fa" ? { caption_fa: value } : { caption_en: value };
    const { error } = await supabase.from("project_images").update(patch).eq("id", img.id);
    if (error) { toast.error(error.message); return; }
    toast.success("توضیح تصویر ذخیره شد");
    refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const reordered = swapItems(items, index, target);
    await Promise.all(
      reordered.map((img, i) => supabase.from("project_images").update({ sort_order: i + 1 }).eq("id", img.id)),
    );
    refresh();
  }

  async function remove(img: ProjectImage) {
    const { error } = await supabase.from("project_images").delete().eq("id", img.id);
    if (error) { toast.error(error.message); return; }
    toast.success("تصویر حذف شد");
    refresh();
  }

  return (
    <Section title={title} description={description}>
      <div>
        <Button type="button" size="pill" onClick={() => inputRef.current?.click()} disabled={uploading > 0}>
          {uploading > 0 ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {uploading > 0 ? `در حال آپلود (${uploading})…` : "افزودن تصویر"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-muted-foreground">هنوز تصویری اضافه نشده.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((img, i) => (
            <li key={img.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row">
              <img src={img.url} alt="" className="h-24 w-full shrink-0 rounded-xl bg-secondary object-cover sm:w-32" />
              <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  defaultValue={img.caption_fa}
                  placeholder="توضیح تصویر (فارسی)"
                  onBlur={(e) => updateCaption(img, "caption_fa", e.target.value)}
                  className="field"
                />
                <input
                  defaultValue={img.caption_en}
                  dir="ltr"
                  placeholder="Caption (English)"
                  onBlur={(e) => updateCaption(img, "caption_en", e.target.value)}
                  className="field"
                />
              </div>
              <div className="flex items-center gap-1.5 sm:flex-col">
                <Button type="button" size="icon-pill" variant="secondary" onClick={() => move(i, -1)} disabled={i === 0} aria-label="بالاتر">
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  size="icon-pill"
                  variant="secondary"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label="پایین‌تر"
                >
                  <ArrowDown />
                </Button>
                <Button type="button" size="icon-pill" variant="destructive-soft" onClick={() => remove(img)} aria-label="حذف تصویر">
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
