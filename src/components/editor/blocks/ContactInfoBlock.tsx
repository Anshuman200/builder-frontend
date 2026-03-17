"use client";
import React from "react";
import { getIcon } from "@/lib/utils/icons";
import type { BlockProps } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext } from "./shared";

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
            onClick={handleWrapperClick}
            style={{
                padding: (p.padding as string) || "1rem 0",
                background: (p.bgColor as string) || "transparent",
                width: "100%",
                boxSizing: "border-box",
                cursor: isPreview ? "default" : "pointer",
                outline: !isPreview && isSelected ? "2px solid var(--primary)" : "none",
                borderRadius: "8px",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: layout === "grid" ? `repeat(${columns}, 1fr)` : "1fr",
                    gap,
                }}
            >
                {items.map((item) => {
                    const Icon = getIcon(item.icon);
                    return (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1.25rem",
                                padding: itemPadding,
                                background: itemBg,
                                borderRadius: itemRadius,
                                border: "1px solid rgba(255,255,255,0.1)",
                                backdropFilter: "blur(10px)",
                                transition: "all 0.3s ease",
                                transform: "translateZ(0)",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.background = itemBg;
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            {showIcons && Icon && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: iconSize * 2,
                                        height: iconSize * 2,
                                        borderRadius: "50%",
                                        background: `${item.color}15`,
                                        color: item.color,
                                        flexShrink: 0,
                                        transition: "transform 0.3s ease",
                                    }}
                                >
                                    <Icon style={{ width: iconSize, height: iconSize, strokeWidth: 2.5 }} />
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
