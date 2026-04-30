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

  return (
    <section
      style={{
        ...bgStyles,
        color: textColor,
      }}
      className={cn(
        "w-full relative overflow-hidden transition-all duration-300",
        // Responsive Padding: use desktop padding on lg+, but smaller on mobile/tablet
        "py-12 px-6 lg:py-20 lg:px-8" 
      )}
    >
      <BackgroundOverlay p={p} />
      <div className={cn(
        "max-w-7xl mx-auto relative z-10",
        layout === "strip" ? "flex flex-wrap justify-around items-center gap-6 lg:gap-8" : cn("grid gap-6 lg:gap-8", gridCols)
      )}>
        {items.map((item, idx) => {
          const IconCmp = getIcon(item.icon);
          const isFocused = !isPreview && subItemFocus?.blockId === block.id && subItemFocus?.index == idx;
          
          const cardBase = getCardStyles({
            props: p,
            isFocused,
          });

          return (
            <motion.div
              key={item.id || idx}
              initial={isPreview ? { opacity: 0, y: 20 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={(e) => {
                  if (isPreview) return;
                  e.stopPropagation();
                  const store = useEditorStore.getState();
                  store.selectBlock(block.id);
                  store.focusSubItem(block.id, idx);
              }}
              className={cn(
                "flex flex-col relative group transition-all duration-300",
                layout === "kpi" ? "items-start text-left" : "items-center text-center",
                // If layout is KPI but no card style, add a very subtle bottom border or spacing
                layout === "kpi" && cardStyle === "none" && "pb-4 border-b border-border/50 lg:border-none"
              )}
              style={cardBase}
            >
              {/* Decorative Glow for Glassmorphism */}
              {isGlass && (
                <div className="absolute -z-10 bg-primary/10 blur-[60px] w-full h-full left-0 top-0 opacity-50 pointer-events-none" />
              )}
              
              {item.icon && (
                <div className={cn(
                  "mb-6 flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                  layout === "kpi" ? "" : "shadow-lg",
                  layout === "strip" && "mb-0 mr-4"
                )}
                style={{ 
                  backgroundColor: (p.iconBg as string) || (layout !== "kpi" ? accentColor : "rgba(var(--primary-rgb), 0.1)"),
                  color: (p.iconColor as string) || (layout === "kpi" ? accentColor : "#fff"),
                  width: (p.iconWrapperSize as string) || (layout === "strip" ? "40px" : layout === "kpi" ? "48px" : "64px"),
                  height: (p.iconWrapperSize as string) || (layout === "strip" ? "40px" : layout === "kpi" ? "48px" : "64px"),
                  borderRadius: (p.iconRadius as string) || "1rem"
                }}>
                  {IconCmp ? (
                    <IconCmp style={{ width: (p.iconSize as string) || "24px", height: (p.iconSize as string) || "24px" }} />
                  ) : (
                    <Square2StackIcon style={{ width: (p.iconSize as string) || "24px", height: (p.iconSize as string) || "24px" }} />
                  )}
                </div>
              )}

              <div className={cn(
                "flex flex-col w-full",
                layout === "strip" ? "items-start text-left" : ""
              )}>
                <div className={cn(
                  "flex items-baseline gap-2 mb-2 flex-wrap",
                  layout === "kpi" || layout === "strip" ? "justify-start" : "justify-center"
                )}>
                  <span className="text-3xl lg:text-5xl font-black tracking-tighter leading-none" style={{ color: layout === "kpi" ? textColor : accentColor }}>
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
                </div>
                
                <h4 className="text-xs lg:text-sm font-black uppercase tracking-widest opacity-40 mb-2">
                  {item.label}
                </h4>
                
                {item.description && (
                  <p className="text-[11px] lg:text-sm opacity-60 lg:max-w-[240px] leading-relaxed mx-auto lg:mx-0">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
