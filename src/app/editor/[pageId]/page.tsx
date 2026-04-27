"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { loadPage, savePage, hasLocalDraft } from "@/lib/utils/storage";
import { migrateProjectName } from "@/lib/config/blocks";
import EditorShell from "@/components/editor/EditorShell";
import { useToasts } from "@/hooks/useToasts";
import { usePage } from "@/lib/api/queries";
import { useLiveHead } from "@/hooks/useLiveHead";
import NewPageWizard from "@/components/editor/NewPageWizard";
import { createBlock, injectProjectName } from "@/lib/config/blocks";

/**
 * Editor Page — The main workspace for building/editing.
 * Fetches plain-text data from server and initializes the store.
 */
export default function EditorPage() {
  const { page, isDirty, setPage, markClean } = useEditorStore();
  const { pageId } = useParams<{ pageId: string }>() ?? {};
  const { error: toastError } = useToasts();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync title and favicon live
  useLiveHead(page);

  const { data: apiPage, isLoading: apiLoading, isError } = usePage(pageId, !!pageId && pageId.length >= 24);

  const [hasLoadedApi, setHasLoadedApi] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (pageId && pageId.length < 24) setIsGuest(true);
  }, [pageId]);

  // Load logic
  useEffect(() => {
    if (!pageId) return;

    if (isGuest) {
      const p = loadPage(pageId);
      const migrated = migrateProjectName(p, p.title ?? "");
      setPage(migrated);
      savePage(pageId, migrated); // persist so reload shows correct name
      markClean();

      const isEmpty = !migrated.routes || migrated.routes.length === 0 || migrated.routes[0].content.length === 0;
      if (isEmpty) {
        setShowWizard(true);
      }
    } else if (apiPage && !hasLoadedApi) {
      if (hasLocalDraft(pageId)) {
        const local = loadPage(pageId);
        const migrated = migrateProjectName(local, local.title ?? "");
        setPage(migrated);
        savePage(pageId, migrated); // persist migrated version
        setHasLoadedApi(true);

        const isEmpty = !migrated.routes || migrated.routes.length === 0 || migrated.routes[0].content.length === 0;
        if (isEmpty) {
          setShowWizard(true);
        }
        // Do NOT markClean — auto-save will push to DB.
      } else {
        const pageData = apiPage.page || apiPage;
        const migrated = migrateProjectName(pageData, pageData.title ?? "");
        setPage(migrated);
        savePage(pageId, migrated); // persist migrated version to local
        markClean();
        setHasLoadedApi(true);

        // TRIGGER WIZARD IF EMPTY
        const isEmpty = !migrated.routes || migrated.routes.length === 0 || migrated.routes[0].content.length === 0;
        if (isEmpty) {
          setShowWizard(true);
        }
      }
    }
  }, [apiPage, pageId, hasLoadedApi, setPage, isGuest, markClean]);

  // Handle API error
  useEffect(() => {
    if (isError && !isGuest) {
      toastError("Failed to load page from server. It may have been deleted.");
      const local = loadPage(pageId);
      if (local && (local.content || local.routes)) {
        setPage(migrateProjectName(local, local.title ?? ""));
      } else {
        setPage({
          id: pageId, title: "Untitled", slug: "untitled", status: "DRAFT",
          theme: { mode: "light", colors: { primary: "#6366f1", secondary: "#8b5cf6", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textMuted: "#64748b", border: "#e2e8f0", accent: "#f59e0b" }, fonts: { heading: "Inter", body: "Inter" }, borderRadius: "md", spacing: "normal" },
          meta: {}, content: [], routes: [], globalBlocks: { header: null, footer: null }
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

  const handleWizardSubmit = async (title: string, slug: string, selectedSections: string[]) => {
    const { updateTitle, updateSlug, addBlock } = useEditorStore.getState();
    const { SECTION_TEMPLATES } = await import("@/lib/config/sections");

    if (title) updateTitle(title);
    if (slug) updateSlug(slug);

    const projectName = title || page?.title || "PageCraft";

    // Sort: header first, footer last, rest in selection order
    const sorted = [
      ...selectedSections.filter((id) => id === "header"),
      ...selectedSections.filter((id) => id !== "header" && id !== "footer"),
      ...selectedSections.filter((id) => id === "footer"),
    ];

    const SECTION_ID_MAP: Record<string, string> = {
      header: "nav-",
      hero: "hero-",
      features: "features-",
      stats: "stats-",
      team: "team-",
      testimonials: "testimonials-",
      pricing: "pricing-",
      contact: "contact-",
      cta: "cta-",
      gallery: "gallery-",
      faq: "faq-",
      footer: "footer-",
    };

    sorted.forEach(id => {
      const prefix = SECTION_ID_MAP[id];
      if (prefix) {
        const template = SECTION_TEMPLATES.find((t) => t.id.startsWith(prefix));
        if (template) {
          const raw = template.create();
          const migrated = injectProjectName(raw, projectName);
          addBlock(migrated);
        }
      }
    });

    setShowWizard(false);
  };

  return (
    <>
      <EditorShell />
      <NewPageWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onSubmit={handleWizardSubmit}
        closable={!(isGuest && (!page?.routes || page.routes.length === 0 || page.routes[0].content.length === 0))}
      />
    </>
  );
}
