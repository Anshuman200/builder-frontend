import type { EditorPage } from "@/@Types";

import { DEFAULT_THEME } from "@/stores/editorStore";
import { slugify } from "@/lib/utils/common";

const KEY = (id: string) => `pagecraft:page:${id}`;

export function loadPage(id: string): EditorPage {
  if (typeof window === "undefined") return createBlankPage(id);
  try {
    const raw = localStorage.getItem(KEY(id));
    if (raw) return JSON.parse(raw) as EditorPage;
  } catch {
    // corrupted data — fall through to blank page
  }
  return createBlankPage(id);
}

export function savePage(id: string, page: EditorPage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY(id), JSON.stringify(page));
  } catch {
    // localStorage full — silently ignore
  }
}

export function hasLocalDraft(id: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY(id)) !== null;
}

export function clearLocalDraft(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY(id));
}

function createBlankPage(id: string): EditorPage {
  return {
    id,
    title: "Untitled Page",
    slug: slugify("untitled-page"),
    content: [],
    theme: DEFAULT_THEME,
    meta: {},
    status: "DRAFT",
  };
}
