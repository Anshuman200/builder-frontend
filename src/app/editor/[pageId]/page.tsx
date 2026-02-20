"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { loadPage, savePage } from "@/lib/storage";
import EditorShell from "@/components/editor/EditorShell";

export default function EditorPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { page, isDirty, setPage, markClean } = useEditorStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load page from localStorage on mount
  useEffect(() => {
    if (!pageId) return;
    const loaded = loadPage(pageId);
    setPage(loaded);
  }, [pageId, setPage]);

  // Debounced auto-save to localStorage (800ms after last change)
  useEffect(() => {
    if (!isDirty || !page || !pageId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      savePage(pageId, page);
      markClean();
    }, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, page, pageId, markClean]);

  if (!page) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", flexDirection: "column", gap: "0.75rem",
        color: "var(--text-muted)",
      }}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: "0.875rem", margin: 0 }}>Loading editor…</p>
      </div>
    );
  }

  return <EditorShell />;
}
