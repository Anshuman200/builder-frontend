"use client";
import type { Block } from "@/types";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BlockProps, getBackgroundStyles, BackgroundOverlay, getTextStyles, SectionChildBlocks } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { proxyApi } from "@/lib/api/client";
import { DEFAULT_THEME } from "@/lib/utils/theme";

/**
 * Helper to extract nested data from an object using a dot-notated string path.
 * Handles paths like "data.terms" or "response.data.legal.privacy".
 */
const getNestedValue = (obj: any, path: string) => {
    if (!path) return obj;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
};

export function LegalBlock({ block }: BlockProps) {
    const p: any = block.props;
    const mode = (p.mode as "manual" | "api") || "manual";
    const dataPath = (p.dataPath as string) || "";
    const apiUrl = (p.apiUrl as string) || "";

    // TanStack Query for API mode
    const { data: apiData, isLoading, isError, error } = useQuery({
        queryKey: ["legal-data", block.id, apiUrl],
        queryFn: async () => {
            if (!apiUrl) return null;
            // Use our backend proxy to bypass CORS
            const { data } = await proxyApi.get(apiUrl);
            return data;
        },
        enabled: mode === "api" && !!apiUrl,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    const viewMode = useEditorStore((s) => s.viewMode);
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);

    // Determine final content
    let finalContent = "";
    let isFetching = false;

    if (mode === "manual") {
        finalContent = (p.content as string) || "";
    } else if (mode === "api") {
        if (isLoading) {
            isFetching = true;
        } else if (isError) {
            finalContent = `<p style='color: #ef4444;'>Error fetching data: ${(error as Error)?.message}</p>`;
        } else if (apiData) {
            const extracted = getNestedValue(apiData, dataPath);
            if (typeof extracted === "string") {
                finalContent = extracted;
            } else if (typeof extracted === "object" && extracted !== null) {
                finalContent = JSON.stringify(extracted, null, 2);
            } else {
                finalContent = `<p style='opacity: 0.5;'>No content found at path: ${dataPath || "root"}</p>`;
            }
        } else if (!apiUrl) {
            finalContent = "<p style='opacity: 0.5; font-style: italic;'>No API URL configured.</p>";
        }
    }

    const wrapperStyle: React.CSSProperties = {
        ...bgStyles,
        padding: (p.padding as string) || "64px 24px",
        color: (getTextStyles(p).color as string) || "var(--text)",
        width: "100%",
        minHeight: "100px",
        position: "relative"
    };

    const contentStyle: React.CSSProperties = {
        maxWidth: "1100px",
        margin: "0 auto",
        lineHeight: 1.7,
        fontSize: "1rem",
        position: "relative",
        zIndex: 2
    };

    const titleStyle: React.CSSProperties = {
        ...getTextStyles(p, "title"),
        textAlign: (p.titleAlign as any) || "left",
        fontSize: (p.titleFontSize as string) || "2rem",
        color: (getTextStyles(p, "title").color as string) || "inherit",
        marginBottom: "2rem",
    };
    return (
        <section
            id={(p.sectionId as string) || `block-${block.id}`}
            style={wrapperStyle}
            className="legal-section-content"
        >
            <BackgroundOverlay p={p} />
            <SectionChildBlocks block={block} isSelected={useEditorStore.getState().selectedBlockId === block.id} topBlocks={p.topBlocks as Block[]} top prefix="legal" />
            <div style={contentStyle}>
                {p.showTitle !== false && p.title && (
                    <h1 className="legal-title" style={titleStyle}>
                        {p.title as string}
                    </h1>
                )}

                {isFetching ? (
                    <div className="skeleton-container">
                        <div className="skeleton-line full"></div>
                        <div className="skeleton-line mid"></div>
                        <div className="skeleton-line mid"></div>
                        <div className="skeleton-line short"></div>
                        <div className="skeleton-spacer"></div>
                        <div className="skeleton-line full"></div>
                        <div className="skeleton-line mid"></div>
                        <div className="skeleton-line full"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                ) : finalContent ? (
                    <div
                        className="prose prose-slate dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: finalContent }}
                    />
                ) : (
                    <p style={{ opacity: 0.4, fontStyle: "italic" }}>Empty section content...</p>
                )}
            </div>

            <style jsx global>{`
                .legal-section-content h1:not(.legal-title) { font-size: 2.25rem; font-weight: 800; margin-bottom: 2rem; }
                .legal-section-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
                .legal-section-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .legal-section-content p { margin-bottom: 1.25rem; }
                .legal-section-content ul, .legal-section-content ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
                .legal-section-content li { margin-bottom: 0.5rem; }

                /* Skeleton Loader */
                .skeleton-container { width: 100%; }
                .skeleton-line {
                    height: 14px;
                    background: "rgba(0,0,0,0.05)";
                    margin-bottom: 12px;
                    border-radius: 4px;
                    position: relative;
                    overflow: hidden;
                }
                .skeleton-line::after {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(0,0,0,0.03), transparent);
                    animation: shimmer 1.5s infinite;
                }
                .skeleton-line.full { width: 100%; }
                .skeleton-line.mid { width: 85%; }
                .skeleton-line.short { width: 60%; }
                .skeleton-spacer { height: 24px; }
                
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }

                @media (max-width: 1024px) {
                    .legal-title {
                        font-size: ${p.titleTabletFontSize || p.titleFontSize || "1.75rem"} !important;
                    }
                }
                @media (max-width: 768px) {
                    .legal-title {
                        font-size: ${p.titleMobileFontSize || p.titleTabletFontSize || p.titleFontSize || "1.5rem"} !important;
                    }
                }
            `}</style>
            <SectionChildBlocks block={block} isSelected={useEditorStore.getState().selectedBlockId === block.id} childBlocks={p.childBlocks as Block[]} bottom prefix="legal" emptyLabel="Drop more blocks here" />
        </section>
    );
}
