"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { DndContext } from "@dnd-kit/core";
import { useEditorStore } from "@/stores/editorStore";
import { loadPage } from "@/lib/utils/storage";
import { BlockRenderer, PreviewProvider } from "@/components/editor/blocks";
import { ActivePathContext } from "@/components/editor/blocks/shared";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { pagesApi } from "@/lib/api/client";
import { applyThemeToElement, DEFAULT_THEME } from "@/lib/utils/theme";
import { useLiveHead } from "@/hooks/useLiveHead";
import { LockOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Input, Button, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

export default function PreviewClient({ pageId, initialData, initialPath = "/" }: { pageId: string, initialData?: any, initialPath?: string }) {
    const { user, isLoading: authLoading } = useAuth();
    const page = useEditorStore((s) => s.page);
    const setPage = useEditorStore((s) => s.setPage);
    const [loading, setLoading] = useState(!page && !initialData);
    const mainRef = React.useRef<HTMLDivElement>(null);
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [isEditorMode, setIsEditorMode] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setIsEditorMode(params.get('isEditor') === 'true');
        }
    }, []);

    // Sync title and favicon live for browser tab
    useLiveHead(page);

    const [isVerified, setIsVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [inputPassword, setInputPassword] = useState("");

    useEffect(() => {
        if (typeof window !== 'undefined' && pageId) {
            const verified = sessionStorage.getItem(`verified_${pageId}`);
            if (verified === 'true') {
                setIsVerified(true);
            }
        }
    }, [pageId]);

    const handleVerify = async () => {
        if (!inputPassword.trim()) return;
        setVerifying(true);
        try {
            await pagesApi.verifyPassword(pageId, inputPassword);
            sessionStorage.setItem(`verified_${pageId}`, 'true');
            setIsVerified(true);
            message.success("Access granted");
        } catch (err: any) {
            message.error(err.message || "Invalid password");
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!pageId) return;

            if (initialData) {
                if (!useEditorStore.getState().page && !cancelled) {
                    setPage(initialData);
                }
                if (!cancelled) setLoading(false);
                return;
            }

            try {
                // ── 1. Try the preview cache (holds current unsaved editor state) ──
                //    This is written by openPreview() in EditorToolbar before opening this tab.
                const cacheRes = await fetch(`/api/preview/${pageId}`);
                if (cacheRes.ok) {
                    const cached = await cacheRes.json();
                    if (cached && !cached.error) {
                        if (cancelled) return;
                        setPage({
                            ...cached,
                            content: Array.isArray(cached.content) ? cached.content : [],
                        });
                        setLoading(false);
                        return;
                    }
                }
            } catch (_) {
                // cache miss — fall through
            }

            try {
                // ── 2. Fall back to backend database (last saved state) ──
                const res = await pagesApi.get(pageId);
                const data = res.data?.page || res.data;

                if (data) {
                    if (cancelled) return;
                    setPage({
                        ...data,
                        content: Array.isArray(data.content) ? data.content : []
                    });
                } else {
                    // ── 3. Last resort: local draft ──
                    if (cancelled) return;
                    setPage(loadPage(pageId));
                }
            } catch (e) {
                console.error("Preview load failed", e);
                // ── 3. Last resort: local draft ──
                if (cancelled) return;
                setPage(loadPage(pageId));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [initialData, pageId, setPage]);

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

    const authorId = page.author || (page as any).ownerUserId;
    const isAuthor = user && authorId && (user._id === authorId || (user as any).id === authorId);

    // Bypass gate if loading (auth or page), if user is author, or if explicitly in editor mode
    if (loading || authLoading) return null; // Wait for data to settle to prevent flickering

    if (!isEditorMode && page?.visibility === 'PRIVATE' && !isVerified && !isAuthor) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white p-6 selection:bg-indigo-500/30">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="max-w-md w-full p-8 md:p-12 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl text-center shadow-2xl shadow-indigo-500/10"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner"
                    >
                        <LockOutlined />
                    </motion.div>

                    <h2 className="text-3xl font-black mb-3 tracking-tight">Private Project</h2>
                    <p className="text-white/40 text-sm mb-10 leading-relaxed max-w-[280px] mx-auto">
                        This project is password protected. Please enter the password to view the content.
                    </p>

                    <div className="flex flex-col gap-4">
                        <Input.Password
                            placeholder="Enter protection password..."
                            value={inputPassword}
                            onChange={e => setInputPassword(e.target.value)}
                            onPressEnter={handleVerify}
                            size="large"
                            className="bg-white/5! border-white/10! text-white! rounded-2xl! h-14! px-5! hover:border-white/20! focus:border-indigo-500/50! transition-all!"
                            prefix={<LockOutlined className="opacity-30 mr-2" />}
                        />
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleVerify}
                            loading={verifying}
                            className="h-14! rounded-2xl! bg-indigo-600! hover:bg-indigo-500! border-0! font-black! text-sm! uppercase! tracking-[0.2em]! shadow-xl! shadow-indigo-500/20! transition-all! active:scale-95!"
                        >
                            Unlock Content
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        if (!page) return <>{children}</>;
        return (
            <DndContext>
                <PreviewProvider>
                    <ActivePathContext.Provider value={normalizedPath}>
                        <main
                            ref={mainRef}
                            className=""
                            style={{ background: "var(--background)", color: "var(--text)", minHeight: "100vh" }}
                        >
                            {children}
                            <ScrollToTop />
                        </main>
                    </ActivePathContext.Provider>
                </PreviewProvider>
            </DndContext>
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
