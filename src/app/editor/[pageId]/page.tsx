"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { loadPage, savePage, hasLocalDraft } from "@/lib/utils/storage";
import EditorShell from "@/components/editor/EditorShell";
import { useToasts } from "@/hooks/useToasts";
import { usePage } from "@/lib/api/queries";

/**
 * Editor Page — The main workspace for building/editing.
 * Fetches plain-text data from server and initializes the store.
 */
export default function EditorPage() {
  const { page, isDirty, setPage, markClean } = useEditorStore();
  const { pageId } = useParams<{ pageId: string }>() ?? {};
  const { error: toastError } = useToasts();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: apiPage, isLoading: apiLoading, isError } = usePage(pageId, !!pageId && pageId.length >= 24);

  const [hasLoadedApi, setHasLoadedApi] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (pageId && pageId.length < 24) setIsGuest(true);
  }, [pageId]);

  // Load logic
  useEffect(() => {
    if (!pageId) return;

    if (isGuest) {
      setPage(loadPage(pageId));
      markClean();
    } else if (apiPage && !hasLoadedApi) {
      if (hasLocalDraft(pageId)) {
        // Recover local draft if available (protects against accidental refresh)
        const local = loadPage(pageId);
        setPage(local);
        setHasLoadedApi(true);
        // Do NOT markClean here, so it eventually auto-saves back to the DB!
      } else {
        const pageData = apiPage.page || apiPage;
        setPage({
          ...pageData,
          content: Array.isArray(pageData.content) ? pageData.content : []
        });
        markClean();
        setHasLoadedApi(true);
      }
    }
  }, [apiPage, pageId, hasLoadedApi, setPage, isGuest, markClean]);

  // Handle API error
  useEffect(() => {
    if (isError && !isGuest) {
      toastError("Failed to load page from server. It may have been deleted.");
      const local = loadPage(pageId);
      if (local && local.content) {
        setPage(local);
      } else {
        setPage({
          id: pageId, title: "Untitled", slug: "untitled", status: "DRAFT",
          theme: { mode: "dark", colors: { primary: "#6366f1", secondary: "#8b5cf6", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textMuted: "#64748b", border: "#e2e8f0", accent: "#f59e0b" }, fonts: { heading: "Inter", body: "Inter" }, borderRadius: "md", spacing: "normal" },
          meta: {}, content: []
        });
      }
    }
  }, [isError, isGuest, pageId, setPage, toastError]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    if (!isDirty || !page || !pageId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      savePage(pageId, page);
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, page, pageId]);

  if (apiLoading || (!page && !isError)) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100dvh", flexDirection: "column", gap: "0.75rem",
        color: "var(--text-muted)", background: "var(--bg)",
      }}>
        <ArrowPathIcon style={{ width: 28, height: 28, animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: "0.875rem", margin: 0 }}>Loading editor…</p>
      </div>
    );
  }

  return <EditorShell />;
}
