"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { DndContext } from "@dnd-kit/core";
import { useEditorStore } from "@/stores/editorStore";
import { loadPage } from "@/lib/utils/storage";
import { BlockRenderer, PreviewProvider } from "@/components/editor/blocks";
import ScrollToTop from "@/components/shared/ScrollToTop";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import { pagesApi } from "@/lib/api/client";
import { applyThemeToElement, DEFAULT_THEME } from "@/lib/utils/theme";
import React from "react";


/**
 * Preview page — renders the page content exactly as it will appear,
 * without any editor chrome. Blocks are fully read-only.
 */
export default function PreviewPage() {
    const { pageId } = useParams<{ pageId: string }>();
    const { page, setPage } = useEditorStore();
    const [loading, setLoading] = useState(!page);
    const mainRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function load() {
            if (!pageId) return;

            try {
                const res = await pagesApi.get(pageId);
                const data = res.data?.page || res.data;

                if (data) {
                    setPage({
                        ...data,
                        content: Array.isArray(data.content) ? data.content : []
                    });
                } else {
                    setPage(loadPage(pageId));
                }
            } catch (e) {
                console.error("Preview load failed", e);
                setPage(loadPage(pageId));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [pageId, setPage]);

    useEffect(() => {
        if (mainRef.current) {
            applyThemeToElement(mainRef.current, page?.theme || DEFAULT_THEME);
        }
    }, [page?.theme]);

    if (loading || !page) {
        return (
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100vh", flexDirection: "column", gap: 12,
                color: "#cbd5e1", background: "#0f172a",
            }}>
                <ArrowPathIcon style={{ width: 28, height: 28, animation: "spin 1s linear infinite" }} />
                <p style={{ fontSize: 14, margin: 0 }}>Loading preview…</p>
            </div>
        );
    }

    return (
        // DndContext is required because blocks.tsx calls useDroppable (even if it returns null in preview)
        <DndContext>
            <PreviewProvider>
                <main 
                    ref={mainRef}
                    style={{ background: "var(--background)", color: "var(--text)", minHeight: "100vh" }}
                >
                    {page.content.map((block) => (
                        <BlockRenderer key={block.id} block={block} />
                    ))}
                    {page.content.length === 0 && (
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            height: "60vh", flexDirection: "column", gap: 8,
                            color: "#94a3b8",
                        }}>
                            <p style={{ fontSize: 16, margin: 0, fontWeight: 500 }}>This page has no content yet.</p>
                            <p style={{ fontSize: 13, margin: 0 }}>Go back to the editor and add some blocks.</p>
                        </div>
                    )}
                    <ScrollToTop />
                    <ThemeSwitcher />
                </main>
            </PreviewProvider>
        </DndContext>
    );
}
