"use client";
import React from "react";
import { getIcon } from "@/lib/utils/icons";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, getCardStyles, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DEFAULT_THEME } from "@/lib/utils/theme";

export function StatsBlock({ block }: BlockProps) {
  const p = block.props;
  const isPreview = React.useContext(PreviewContext);
  const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
  const viewMode = useEditorStore((s) => s.viewMode);
  const focusSubItem = useEditorStore((s) => s.focusSubItem);
  const subItemFocus = useEditorStore((s) => s.subItemFocus);

  const bgStyles = getBackgroundStyles(p, theme);

  const layout = (p.layout as string) || "grid";
  const columns = Number(p.columns || 4);
  const items = (p.items as any[]) || [];
  const cardStyle = (p.cardStyle as string) || "none";
  const isGlass = cardStyle === "glass";

  const textColor = (p.textColor as string) || "var(--text)";
  const accentColor = (p.accentColor as string) || "var(--primary)";

  const gridCols = React.useMemo(() => {
    // If we're in the editor and simulating a view, force the grid
    if (viewMode === "mobile") return "grid-cols-1";
    if (viewMode === "tablet") return "grid-cols-2";

    // Standard responsive classes for the published site
    const mapping: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
      6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    };
    return mapping[columns] || mapping[4];
  }, [columns, viewMode]);

    const iconPosition = (p.iconPosition as string) || "center";
    const gapVal = (p.gap as string) || "2rem";
    const titleSize = (p.titleSize as string) || "2.25rem";
    const subtitleSize = (p.subtitleSize as string) || "1rem";
    const descSize = (p.descSize as string) || "0.9rem";
    const descColor = (p.descColor as string) || "var(--text-subtle)";

    const align = (p.align as string) || (layout === "kpi" ? "left" : "center");
    const cardAlignment = {
        left: "items-start text-left",
        center: "items-center text-center",
        right: "items-end text-right",
        justify: "items-stretch text-justify"
    }[align] || "items-center text-center";

    const cardContentAlignment = {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
        justify: "justify-between"
    }[align] || "justify-center";

    // Icon-specific alignment
    const iconAlignment = {
        "flex-start": "self-start",
        "center": "self-center",
        "flex-end": "self-end"
    }[iconPosition] || "self-center";

    return (
        <section
            style={{
                ...bgStyles,
                color: textColor,
            }}
            className={cn(
                "w-full relative overflow-hidden transition-all duration-300",
                "py-12 px-6 lg:py-20 lg:px-8" 
            )}
        >
            <BackgroundOverlay p={p} />
            <div 
                className={cn(
                    "relative z-10",
                    layout === "strip" ? "flex flex-wrap justify-around items-center" : cn("grid", gridCols)
                )}
                style={{ gap: gapVal }}
            >
                {items.map((item, idx) => {
                    const IconCmp = getIcon(item.icon);
                    const isFocused = !isPreview && subItemFocus?.blockId === block.id && subItemFocus?.index == idx;
                    
                    const cardBase = getCardStyles({
                        props: p,
                        isFocused,
                    });

                    return (
                        <motion.div
                            layout
                            key={item.id || idx}
                            initial={isPreview ? { opacity: 0, y: 20 } : false}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ 
                                delay: idx * 0.1,
                                layout: { duration: 0.4, ease: "easeInOut" }
                            }}
                            onClick={(e) => {
                                if (isPreview) return;
                                e.stopPropagation();
                                const store = useEditorStore.getState();
                                store.selectBlock(block.id);
                                store.focusSubItem(block.id, idx);
                            }}
                            className={cn(
                                "flex flex-col relative group transition-all duration-500",
                                cardAlignment,
                                layout === "kpi" && cardStyle === "none" && "pb-4 border-b border-border/50 lg:border-none"
                            )}
                            style={cardBase}
                        >
                            {/* Decorative Glow for Glassmorphism */}
                            {isGlass && (
                                <motion.div 
                                    layout
                                    className="absolute -z-10 bg-primary/10 blur-[60px] w-full h-full left-0 top-0 opacity-50 pointer-events-none" 
                                />
                            )}
                            
                            {item.icon && (
                                <motion.div 
                                    layout
                                    className={cn(
                                        "mb-6 flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                                        layout === "kpi" ? "" : "shadow-lg",
                                        layout === "strip" && "mb-0 mr-4",
                                        iconAlignment
                                    )}
                                    onClick={(e) => {
                                        if (isPreview) return;
                                        e.stopPropagation();
                                        const store = useEditorStore.getState();
                                        store.selectBlock(block.id);
                                        store.focusSubItem(block.id, "Icon Styling");
                                    }}
                                    style={{ 
                                        backgroundColor: p.iconBg ? (p.iconBg as string) : (layout === "kpi" ? "rgba(var(--primary-rgb), 0.1)" : accentColor),
                                        color: p.iconColor ? (p.iconColor as string) : (layout === "kpi" ? accentColor : "#fff"),
                                        width: (p.iconWrapperSize as string) || (layout === "strip" ? "40px" : layout === "kpi" ? "48px" : "64px"),
                                        height: (p.iconWrapperSize as string) || (layout === "strip" ? "40px" : layout === "kpi" ? "48px" : "64px"),
                                        borderRadius: (p.iconRadius as string) || "1rem",
                                        flexShrink: 0
                                    }}>
                                    {IconCmp ? (
                                        <IconCmp style={{ width: (p.iconSize as string) || "24px", height: (p.iconSize as string) || "24px" }} />
                                    ) : (
                                        <Square2StackIcon style={{ width: (p.iconSize as string) || "24px", height: (p.iconSize as string) || "24px" }} />
                                    )}
                                </motion.div>
                            )}

                            <motion.div 
                                layout
                                className={cn(
                                    "flex flex-col w-full transition-all duration-500",
                                    cardAlignment
                                )}
                            >
                                <motion.div 
                                    layout
                                    className={cn(
                                        "flex items-baseline gap-2 mb-2 flex-wrap transition-all duration-500",
                                        cardContentAlignment
                                    )}
                                >
                                    <span className="font-black tracking-tighter leading-none" style={{ color: layout === "kpi" ? textColor : accentColor, fontSize: titleSize }}>
                                        {item.value}
                                    </span>
                                    
                                    {(item.unit || item.trend) && (
                                        <div className="flex items-center gap-2">
                                            {item.unit && (
                                                <span className="text-lg lg:text-xl font-bold opacity-60">
                                                    {item.unit}
                                                </span>
                                            )}
                                            {item.trend && item.trend !== "none" && (
                                                <div className={cn(
                                                    "flex items-center text-[10px] lg:text-xs font-bold px-2 py-0.5 rounded-full",
                                                    item.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                                )}>
                                                    {item.trend === "up" ? "↑" : "↓"} {item.trendValue}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                                
                                <motion.h4 
                                    layout
                                    className="font-black uppercase tracking-widest mb-2 transition-all duration-500" 
                                    style={{ opacity: 0.4, fontSize: subtitleSize }}
                                >
                                    {item.label}
                                </motion.h4>
                                
                                {item.description && (
                                    <motion.p 
                                        layout
                                        className="leading-relaxed transition-all duration-500" 
                                        style={{ fontSize: descSize, color: descColor, opacity: 0.8, maxWidth: "100%" }}
                                    >
                                        {item.description}
                                    </motion.p>
                                )}
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
