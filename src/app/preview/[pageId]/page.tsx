"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { DndContext } from "@dnd-kit/core";
import { useEditorStore } from "@/stores/editorStore";
import { loadPage } from "@/lib/storage";
import { BlockRenderer, PreviewProvider } from "@/components/editor/blocks";
import ScrollToTop from "@/components/shared/ScrollToTop";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import { pagesApi } from "@/lib/api/client";

/**
 * Preview page — renders the page content exactly as it will appear,
 * without any editor chrome. Blocks are fully read-only.
 */
export default function PreviewPage() {
    const { pageId } = useParams<{ pageId: string }>();
    const { page, setPage } = useEditorStore();

    const [loading, setLoading] = useState(!page);

    useEffect(() => {
        if (!pageId) return;

        // Try cross-device API store first (for phones / LAN IP)
        fetch(`/api/preview/${pageId}`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data && data.content) {
                    setPage(data);
                    setLoading(false);
                } else {
                    fallbackLoad();
                }
            })
            .catch(() => fallbackLoad());

        function fallbackLoad() {
            if (pageId.length >= 24) {
                pagesApi.get(pageId)
                    .then(({ data: apiPage }) => {
                        if (apiPage) {
                            const pageData = apiPage.page || apiPage;
                            const content = pageData.content?.root?.children
                                || (Array.isArray(pageData.content) ? pageData.content : []);
                            setPage({ ...pageData, content });
                        } else {
                            // Fallback if DB fetch fails
                            setPage(loadPage(pageId));
                        }
                    })
                    .catch(() => setPage(loadPage(pageId)))
                    .finally(() => setLoading(false));
            } else {
                // Origin-bound localStorage fallback for guest mode tabs
                setPage(loadPage(pageId));
                setLoading(false);
            }
        }
    }, [pageId, setPage]);

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
                <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
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
