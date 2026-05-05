import type { Block } from "@/types";
// components/editor/blocks/AccordionBlock.tsx
import React, { useState } from "react";
import { ChevronDownIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { getIcon } from "@/lib/utils/icons";
import { ChildBlockWrapper, PreviewContext, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { DEFAULT_THEME } from "@/lib/utils/theme";


export default function AccordionBlock({ block }: { block: Block }) {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const focusSubItem = useEditorStore((s) => s.focusSubItem);
    const subItemFocus = useEditorStore((s) => s.subItemFocus);
    const isPreview = React.useContext(PreviewContext);

    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(block.props, theme);

    // Fallback to defaults if properties are missing
    const items = Array.isArray(block.props.items) ? block.props.items : [];
    const width = (block.props.width as string) || "100%";
    const maxWidth = (block.props.maxWidth as string) || "800px";
    const padding = (block.props.padding as string) || "24px";

    // Typography
    const titleSize = (block.props.titleSize as string) || "16px";
    const titleWeight = (block.props.titleWeight as string) || "600";
    const descSize = (block.props.descSize as string) || "15px";

    // Icon
    const showIcons = block.props.showIcons !== false;
    const iconStyle = (block.props.iconStyle as string) || "chevron"; // chevron, plus
    const iconSize = (block.props.iconSize as string) || "20px";

    // Item Styling

    const itemBgColor = (block.props.itemBgColor as string) || "#ffffff";
    const itemBorderColor = (block.props.itemBorderColor as string) || "#e2e8f0";
    const itemRadius = (block.props.itemRadius as string) || "8px";

    const defaultPrimary = theme.colors?.primary || "#6366f1";

    const titleColor = (block.props.titleColor as string) || "#0f172a";
    const contentColor = (block.props.contentColor as string) || "#475569";
    const iconColor = (block.props.iconColor as string) || defaultPrimary;

    const divider = (block.props.divider as string) || "line";
    const variant = (block.props.variant as string) || "contained";

    const toggleItem = (id: string, index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent block selection from interfering
        if (!isPreview) focusSubItem(block.id, index);
        setOpenItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getVariantStyles = (index: number, total: number) => {
        let styles: React.CSSProperties = {
            backgroundColor: itemBgColor,
            transition: "all 0.2s ease",
        };

        if (variant === "separated") {
            styles.marginBottom = "12px";
            styles.borderRadius = itemRadius;
            styles.border = `1px solid ${itemBorderColor}`;
            styles.overflow = "hidden";
        } else if (variant === "contained") {
            styles.border = `1px solid ${itemBorderColor}`;
            // In contained mode, items are stacked with shared borders
            if (index > 0) styles.borderTop = "none";
            if (index === 0) {
                styles.borderTopLeftRadius = itemRadius;
                styles.borderTopRightRadius = itemRadius;
            }
            if (index === total - 1) {
                styles.borderBottomLeftRadius = itemRadius;
                styles.borderBottomRightRadius = itemRadius;
            }
        } else {
            // minimal variant (just text and dividers)
            styles.backgroundColor = "transparent";
            if (divider === "line" && index < total - 1) {
                styles.borderBottom = `1px solid ${itemBorderColor}`;
            }
        }

        return styles;
    };

    return (
        <div
            id={(block.props.sectionId as string) || `block-${block.id}`}
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                ...bgStyles,
                padding: padding,
                position: "relative"
            }}
        >
            <BackgroundOverlay p={block.props} />
            <div style={{ width, maxWidth, position: "relative", zIndex: 2 }}>
                {items.map((item: any, index: number) => {
                    const isOpen = !!openItems[item.id];
                    const isFocused = !isPreview && subItemFocus?.blockId === block.id && subItemFocus?.index == index;
                    const focusedStyle = isFocused ? {
                        boxShadow: "0 0 0 2px #6366f1, 0 0 20px rgba(99,102,241,0.4)",
                        zIndex: 10,
                        transform: "scale(1.01)",
                        background: 'rgba(99,102,241,0.03)'
                    } : {};

                    return (
                        <div key={item.id} style={{ ...getVariantStyles(index, items.length), ...focusedStyle }}
                            onClick={(e) => {
                            if (isPreview) return;
                            e.stopPropagation();
                            const store = useEditorStore.getState();
                            store.selectBlock(block.id);
                            store.focusSubItem(block.id, index);
                        }}
                        >
                            {/* Header (Clickable) */}
                            <div
                                onClick={(e) => toggleItem(item.id, index, e)}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "16px 20px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    {showIcons && item.icon && (
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
                                                width: (block.props.iconWrapperSize as string) || "40px",
                                                height: (block.props.iconWrapperSize as string) || "40px",
                                                borderRadius: (block.props.iconRadius as string) || "8px",
                                                background: (block.props.iconBg as string) || "rgba(var(--primary-rgb), 0.1)",
                                                color: (block.props.iconColor as string) || iconColor,
                                                flexShrink: 0
                                            }}
                                        >
                                            {(() => {
                                                const IconCmp = getIcon(item.icon);
                                                const C = IconCmp || Square2StackIcon;
                                                return <C style={{ width: (block.props.iconSize as string) || "20px", height: (block.props.iconSize as string) || "20px" }} />;
                                            })()}
                                        </div>
                                    )}
                                    <div style={{ fontWeight: Number(titleWeight) || 600, color: titleColor, fontSize: titleSize, textTransform: block.props.titleUppercase ? "uppercase" : "none" }}>
                                        {item.title}
                                    </div>
                                </div>
                                {iconStyle === "plus" ? (
                                    <div style={{ position: "relative", width: iconSize, height: iconSize, }}>
                                        <div style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            width: "100%",
                                            height: "2px",
                                            backgroundColor: iconColor,
                                            transform: isOpen ? "translate(-50%, -50%) rotate(180deg)" : "translate(-50%, -50%) rotate(0)",
                                            transition: "transform 0.3s ease",
                                        }} />
                                        <div style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            width: "2px",
                                            height: "100%",
                                            backgroundColor: iconColor,
                                            transform: isOpen ? "translate(-50%, -50%) rotate(90deg)" : "translate(-50%, -50%) rotate(0)",
                                            transition: "transform 0.3s ease",
                                            opacity: isOpen ? 0 : 1,
                                        }} />
                                    </div>
                                ) : (
                                    <ChevronDownIcon
                                        style={{
                                            width: iconSize,
                                            height: iconSize,
                                            color: iconColor,
                                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "transform 0.3s ease",
                                        }}
                                    />
                                )}
                            </div>

                            {/* Collapsible Content */}
                            <div
                                style={{
                                    maxHeight: isOpen ? "500px" : "0px",
                                    overflow: "hidden",
                                    transition: "max-height 0.3s ease-in-out",
                                }}
                            >
                                <div
                                    style={{
                                        padding: "0 20px 20px 20px",
                                        color: contentColor,
                                        fontSize: descSize,
                                        textTransform: block.props.descUppercase ? "uppercase" : "none",
                                        lineHeight: "1.6",
                                        borderTop: (isOpen && divider === "line" && variant !== "minimal") ? `1px solid ${itemBorderColor}` : "none",
                                        paddingTop: (isOpen && divider === "line" && variant !== "minimal") ? "16px" : "0",
                                        marginTop: (isOpen && divider === "line" && variant !== "minimal") ? "4px" : "0",
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
