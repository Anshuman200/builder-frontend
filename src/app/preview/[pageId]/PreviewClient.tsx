"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { DndContext } from "@dnd-kit/core";
import { useEditorStore } from "@/stores/editorStore";
import { loadPage } from "@/lib/utils/storage";
import { BlockRenderer, PreviewProvider } from "@/components/editor/blocks";
import ScrollToTop from "@/components/shared/ScrollToTop";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import { pagesApi } from "@/lib/api/client";
import { applyThemeToElement, DEFAULT_THEME } from "@/lib/utils/theme";
import { useLiveHead } from "@/hooks/useLiveHead";
import PrivatePageGate from "@/components/public/PrivatePageGate";
import React from "react";

export default function PreviewClient({ pageId, initialPath = "/" }: { pageId: string, initialPath?: string }) {
    const { page, setPage } = useEditorStore();
    const [loading, setLoading] = useState(!page);
    const mainRef = React.useRef<HTMLDivElement>(null);
    const [currentPath, setCurrentPath] = useState(initialPath);

    // Sync title and favicon live for browser tab
    useLiveHead(page);

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

    useEffect(() => {
        // Handle hash-based routing for internal navigation within the editor/preview
        const handler = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash.startsWith('/')) {
                setCurrentPath(hash);
            } else if (!hash && initialPath) {
                setCurrentPath(initialPath);
            }
        };
        window.addEventListener("hashchange", handler);
        handler(); // Initialize
        return () => window.removeEventListener("hashchange", handler);
    }, [initialPath]);

    if (loading || !page) {
        return (
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100vh", flexDirection: "column", gap: 12,
                color: "#cbd5e1", background: "#0f172a",
            }}>
                <ArrowPathIcon style={{ width: 28, height: 28, animation: "spin 1s linear infinite" }} />
                <p style={{ fontSize: 14, margin: 0 }}>Loading…</p>
            </div>
        );
    }

    const normalizedPath = currentPath === "" ? "/" : currentPath;
    const activeRoute = page.routes?.find(r => r.path === normalizedPath) 
        || page.routes?.find(r => r.path === "/") 
        || page.routes?.[0];
    
    const content = activeRoute?.content || page.content || [];
    const header = page.globalBlocks?.header;
    const footer = page.globalBlocks?.footer;

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        if (!page) return <>{children}</>;
        return (
            <PrivatePageGate pageId={pageId} isPrivate={page.visibility === 'PRIVATE'}>
                <DndContext>
                    <PreviewProvider>
                        <main 
                            ref={mainRef}
                            style={{ background: "var(--background)", color: "var(--text)", minHeight: "100vh" }}
                        >
                            {children}
                            <ScrollToTop />
                            <ThemeSwitcher />
                        </main>
                    </PreviewProvider>
                </DndContext>
            </PrivatePageGate>
        );
    };

    return (
        <Wrapper>
            {(header && !activeRoute?.hideHeader) && <BlockRenderer key={`header-${header.id}`} block={header} />}
            {content.map((block: any) => (
                <BlockRenderer key={block.id} block={block} />
            ))}
            {content.length === 0 && (
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: "60vh", flexDirection: "column", gap: 8,
                    color: "#94a3b8",
                }}>
                    <p style={{ fontSize: 16, margin: 0, fontWeight: 500 }}>This page has no content yet.</p>
                    <p style={{ fontSize: 13, margin: 0 }}>Go back to the editor and add some blocks.</p>
                </div>
            )}
            {(footer && !activeRoute?.hideFooter) && <BlockRenderer key={`footer-${footer.id}`} block={footer} />}
        </Wrapper>
    );
}
