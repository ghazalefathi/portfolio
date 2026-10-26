import { describe, expect, it } from "vitest";
import { pickLang } from "@/lib/i18n";

describe("pickLang", () => {
  it("shows the Persian text in Persian mode", () => {
    expect(pickLang("fa", "غزاله", "Ghazaleh")).toBe("غزاله");
  });

  it("shows the English text in English mode", () => {
    expect(pickLang("en", "غزاله", "Ghazaleh")).toBe("Ghazaleh");
  });

  it("falls back to the other language when the active one is empty", () => {
    expect(pickLang("en", "فقط فارسی", "")).toBe("فقط فارسی");
    expect(pickLang("fa", "  ", "English only")).toBe("English only");
  });
});
