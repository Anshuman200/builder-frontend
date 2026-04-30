"use client";
import React from "react";
import { getIcon } from "@/lib/utils/icons";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, getCardStyles, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";

interface ContactItem {
    id: string;
    title: string;
    content: string;
    icon: string;
    color: string;
}

export function ContactInfoBlock({ block }: BlockProps) {
    const isPreview = React.useContext(PreviewContext);
    const { updateBlock, selectedBlockId } = useEditorStore();
    const p = block.props;
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);

    const items = (p.items as ContactItem[]) || [];
    const layout = (p.layout as "list" | "grid") || "list";
    const columns = (p.columns as number) || 1;
    const gap = (p.gap as string) || "1.5rem";
    const itemBg = (p.itemBg as string) || "rgba(255,255,255,0.05)";
    const itemRadius = (p.itemRadius as string) || "12px";
    const itemPadding = (p.itemPadding as string) || "1.25rem";
    const showIcons = p.showIcons !== false;
    const iconSize = parseInt((p.iconSize as string) || "24");
    const titleSize = (p.titleSize as string) || "0.9rem";
    const contentSize = (p.contentSize as string) || "1rem";
    const textColor = (p.textColor as string) || "var(--text)";

    const isSelected = selectedBlockId === block.id;

    const handleWrapperClick = (e: React.MouseEvent) => {
        if (!isPreview) {
            e.stopPropagation();
            const store = useEditorStore.getState();
            store.selectBlock(block.id);
        }
    };

    return (
        <div
            id={(p.sectionId as string) || `block-${block.id}`}
            onClick={handleWrapperClick}
            style={{
                ...bgStyles,
                padding: (p.padding as string) || "1rem 0",
                width: "100%",
                boxSizing: "border-box",
                cursor: isPreview ? "default" : "pointer",
                outline: !isPreview && isSelected ? "2px solid var(--primary)" : "none",
                borderRadius: "8px",
                position: "relative"
            }}
        >
            <BackgroundOverlay p={p} />
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: layout === "grid" ? `repeat(${columns}, 1fr)` : "1fr",
                    gap,
                    position: "relative",
                    zIndex: 2
                }}
            >
                {items.map((item, idx) => {
                    const Icon = getIcon(item.icon);
                    const baseStyle = getCardStyles({
                        props: {
                            ...p,
                            cardStyle: p.cardStyle || (p.itemBg ? "filled" : "none"),
                            cardBg: p.itemBg,
                            cardRadius: p.itemRadius,
                            cardShadow: p.itemShadow,
                            cardPadding: p.itemPadding,
                        },
                        isFocused: false, // Contact items aren't sub-item focusable in the same way yet, but we'll use base
                    });

                    return (
                        <div
                            key={item.id || idx}
                            style={{
                                ...baseStyle,
                                display: "flex",
                                alignItems: "center",
                                gap: "1.25rem",
                            }}
                            onMouseEnter={e => isPreview && Object.assign(e.currentTarget.style, {
                                ...getCardStyles({
                                    props: {
                                        ...p,
                                        cardStyle: p.cardStyle || (p.itemBg ? "filled" : "none"),
                                        cardBg: p.itemBg,
                                        cardRadius: p.itemRadius,
                                        cardShadow: p.itemShadow,
                                        cardPadding: p.itemPadding,
                                    },
                                    isHovered: true
                                }),
                                display: "flex",
                                alignItems: "center",
                                gap: "1.25rem",
                            })}
                            onMouseLeave={e => isPreview && Object.assign(e.currentTarget.style, {
                                ...baseStyle,
                                display: "flex",
                                alignItems: "center",
                                gap: "1.25rem",
                            })}
                        >
                            {showIcons && Icon && (
                                <div
                                    onClick={(e) => {
                                        if (isPreview) return;
                                        e.stopPropagation();
                                        const store = useEditorStore.getState();
                                        store.selectBlock(block.id);
                                        store.focusSubItem(block.id, "Icon Styling");
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: (p.iconWrapperSize as string) || `${iconSize * 2}px`,
                                        height: (p.iconWrapperSize as string) || `${iconSize * 2}px`,
                                        borderRadius: (p.iconRadius as string) || "50%",
                                        background: (p.iconBg as string) || `${item.color}15`,
                                        color: (p.iconColor as string) || item.color,
                                        flexShrink: 0,
                                        transition: "transform 0.3s ease",
                                    }}
                                >
                                    <Icon style={{ width: (p.iconSize as string) || `${iconSize}px`, height: (p.iconSize as string) || `${iconSize}px`, strokeWidth: 2.5 }} />
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        fontSize: titleSize,
                                        fontWeight: 700,
                                        color: "rgba(255,255,255,0.4)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    {item.title}
                                </div>
                                <div
                                    style={{
                                        fontSize: contentSize,
                                        fontWeight: 500,
                                        color: textColor,
                                        whiteSpace: "pre-line",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {item.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
