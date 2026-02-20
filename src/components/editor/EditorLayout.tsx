"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore, EditorPage, DEFAULT_THEME } from "@/stores/editorStore";
import { pagesApi } from "@/lib/api/client";
import { Toolbar } from "./Toolbar";
import { BlockPanel } from "./BlockPanel";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { Loader2 } from "lucide-react";

interface EditorLayoutProps {
  pageId: string;
}

export function EditorLayout({ pageId }: EditorLayoutProps) {
  const router = useRouter();
  const { page, setPage, markClean, setIsSaving } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load page data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    pagesApi.get(pageId)
      .then(({ data }) => {
        if (cancelled) return;
        const rawPage = data.page ?? data;
        const editorPage: EditorPage = {
          id: rawPage.id ?? rawPage._id ?? pageId,
          title: rawPage.title ?? "Untitled Page",
          slug: rawPage.slug ?? "",
          content: rawPage.content ?? [],
          theme: rawPage.theme ?? DEFAULT_THEME,
          meta: rawPage.meta ?? {},
          status: rawPage.status ?? "DRAFT",
        };
        setPage(editorPage);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load page. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pageId, setPage]);

  const handleSave = useCallback(async () => {
    if (!page) return;
    setSaving(true);
    setIsSaving(true);
    try {
      await pagesApi.update(page.id, {
        title: page.title,
        content: page.content,
        theme: page.theme,
        meta: page.meta,
      });
      markClean();
    } catch {
      // silent error — user sees the unsaved indicator
    } finally {
      setSaving(false);
      setIsSaving(false);
    }
  }, [page, markClean, setIsSaving]);

  const handlePublish = useCallback(async () => {
    if (!page) return;
    setPublishing(true);
    try {
      if (page.status === "PUBLISHED") {
        await pagesApi.unpublish(page.id);
        setPage({ ...page, status: "DRAFT" });
      } else {
        // Save first, then publish
        await pagesApi.update(page.id, { content: page.content, theme: page.theme, meta: page.meta });
        await pagesApi.publish(page.id);
        setPage({ ...page, status: "PUBLISHED" });
        markClean();
      }
    } catch {
      /* ignore */
    } finally {
      setPublishing(false);
    }
  }, [page, setPage, markClean]);

  // Ctrl/Cmd+S to save
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleSave]);

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", flexDirection: "column", gap: "1rem",
        color: "var(--text-muted)",
      }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: "0.9rem", margin: 0 }}>Loading editor…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", flexDirection: "column", gap: "1rem",
      }}>
        <p style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "0.6rem 1.25rem",
            background: "var(--primary)", color: "white",
            border: "none", borderRadius: "var(--radius)",
            cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Toolbar
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={() => setPreviewOpen(true)}
        saving={saving}
        publishing={publishing}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <BlockPanel />
        <Canvas />
        <PropertiesPanel />
      </div>

      {/* Preview modal */}
      {previewOpen && page && (
        <PreviewModal page={page} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}

// ─── Preview Modal ───────────────────────────────────────────────────────────

function PreviewModal({ page, onClose }: { page: EditorPage; onClose: () => void }) {
  const { BlockRenderer } = require("./blocks/BlockRenderer");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Preview toolbar */}
      <div style={{
        height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 1rem",
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
          Preview — {page.title}
        </span>
        <button
          onClick={onClose}
          style={{
            padding: "0.375rem 0.875rem",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", cursor: "pointer",
            color: "var(--text)", fontWeight: 600, fontSize: "0.8rem",
          }}
        >
          Close Preview
        </button>
      </div>

      {/* Preview content */}
      <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
        {page.content.map((block) => (
          <BlockRenderer key={block.id} block={block} preview />
        ))}
        {page.content.length === 0 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "50vh", color: "#94a3b8", fontSize: "0.9rem",
          }}>
            No blocks added yet
          </div>
        )}
      </div>
    </div>
  );
}
