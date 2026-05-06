"use client";

import type { Block } from "@/types";
import React, { useState, memo } from "react";
import {
  useDroppable,
  useDndMonitor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TrashIcon, Square2StackIcon, PlusIcon,
  Squares2X2Icon, ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";
import { useEditorStore, LIGHT_COLORS } from "@/stores/editorStore";
import { useEditorCanvasState } from "@/stores/editor/selectors";
import { applyThemeToElement, DEFAULT_THEME } from "@/lib/utils/theme";
import { BlockRenderer, WaveQuickEditor, TextQuickEditor } from "./blocks";
import { ActivePathContext, getBlockMediaInfo, QuickLayoutChange } from "./blocks/shared";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { IconButton } from "../ui/IconButton";
import AppToolTip from "../common/AppToolTip";
import { cn } from "@/lib/utils";

// Viewport widths per mode
const VIEWPORT_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
} as const;

const WaveIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
  </svg>
);

// ─── Main Canvas ──────────────────────────────────────────────────────────────

export default function EditorCanvas() {
  const { page, viewMode, selectBlock, updateTheme, activeRouteId, waveEditorPos, setWaveEditorPos, textEditorPos, setTextEditorPos, selectedBlockId } = useEditorCanvasState();
  const dragControls = useDragControls();

  const activeRoute = page?.routes?.find(r => r.id === activeRouteId);
  const routeBlocks = activeRoute?.content ?? [];

  // Helper to find the currently selected block's data
  const findBlock = (blocks: Block[], id: string): Block | null => {
    for (const b of blocks) {
      if (b.id === id) return b;
      if (b.children) {
        const found = findBlock(b.children, id);
        if (found) return found;
      }
      // Check column props
      const colProps = ["col0", "col1", "childBlocks"];
      for (const p of colProps) {
        if (Array.isArray(b.props[p])) {
          const found = findBlock(b.props[p] as Block[], id);
          if (found) return found;
        }
      }
      // Check items array
      if (Array.isArray(b.props.items)) {
        for (const item of b.props.items as any[]) {
          if (item.blocks) {
            const found = findBlock(item.blocks, id);
            if (found) return found;
          }
        }
      }
    }
    return null;
  };

  const selectedBlock = selectedBlockId ? findBlock([...(page?.globalBlocks?.header ? [page.globalBlocks.header] : []), ...routeBlocks, ...(page?.globalBlocks?.footer ? [page.globalBlocks.footer] : [])], selectedBlockId) : null;

  const blocks = [
    ...(page?.globalBlocks?.header && !activeRoute?.hideHeader ? [page?.globalBlocks?.header] : []),
    ...routeBlocks,
    ...(page?.globalBlocks?.footer && !activeRoute?.hideFooter ? [page?.globalBlocks?.footer] : [])
  ];
  const themeMode = page?.theme?.mode || "light";
  const activeRoutePath = activeRoute?.path || "/";

  const isConstrained = viewMode !== "desktop";
  const canvasWidth = VIEWPORT_WIDTHS[viewMode];


  const canvasRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [dragBounds, setDragBounds] = React.useState({ left: 20, top: 20, right: 20, bottom: 20 });

  // Update drag boundaries based on the scroll container's viewport position
  React.useEffect(() => {
    const updateBounds = () => {
      if (scrollRef.current) {
        const rect = scrollRef.current.getBoundingClientRect();
        // Constraints are relative to the viewport for position: fixed
        // We subtract the editor's width/height roughly to keep the whole box inside
        setDragBounds({
          left: rect.left,
          top: rect.top,
          right: rect.right - 340, // 340 is the editor width
          bottom: rect.bottom - 450 // 450 is a safe height estimate
        });
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    // Also update when blocks or selection changes as it might affect layout
    const timer = setTimeout(updateBounds, 100);
    return () => {
      window.removeEventListener("resize", updateBounds);
      clearTimeout(timer);
    };
  }, [selectedBlockId, waveEditorPos, textEditorPos]);

  // Apply theme object to CSS variables on mount and whenever theme changes
  React.useEffect(() => {
    if (!canvasRef.current) return;
    applyThemeToElement(canvasRef.current, page?.theme || DEFAULT_THEME);
  }, [page?.theme]);

  // Scroll to top on route change
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeRouteId]);

  return (
    // Outer scroll area
    <div
      id="editor-scroll-container"
      ref={scrollRef}
      style={{
        flex: 1,
        overflow: "auto",
        background: "var(--bg)",
        padding: isConstrained ? "24px 16px" : 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          selectBlock(null);
        }
      }}
    >
      {/* Viewport label */}
      {isConstrained && (
        <div style={{
          marginBottom: 8,
          fontSize: 11,
          color: "var(--text-subtle)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: "monospace",
        }}>
          {viewMode === "tablet" ? "Tablet · 768px" : "Mobile · 390px"}
        </div>
      )}

      {/* Page canvas — dark class scoped here so only blocks are affected */}
      <div
        id="editor-canvas-root"
        ref={canvasRef}
        className=""
        style={{
          width: canvasWidth,
          minHeight: "100dvh",
          background: "var(--background)",
          color: "var(--text)",
          boxShadow: isConstrained ? "0 4px 24px rgba(0,0,0,0.15)" : "none",
          borderRadius: isConstrained ? 8 : 0,
          overflow: "clip",
          transition: "width 0.25s ease, background 0.3s ease",
          flexShrink: 0,
          position: "relative",
          transform: "translate3d(0, 0, 0)", // Creates local containing block for fixed elements
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            selectBlock(null);
          }
        }}
      >
        <ActivePathContext.Provider value={activeRoutePath}>
          <DropZone
            blocks={blocks}
            routeBlocksLength={routeBlocks.length}
            headerId={page?.globalBlocks?.header && !activeRoute?.hideHeader ? page.globalBlocks.header.id : undefined}
            footerId={page?.globalBlocks?.footer?.id}
          />
        </ActivePathContext.Provider>
      </div>

      <AnimatePresence>
        {waveEditorPos && selectedBlock && (
          <motion.div
            key={`global-wave-editor`}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={true}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            dragConstraints={dragBounds}
            dragElastic={0}
            onDragEnd={(_, info) => {
              // The delta movement is added to the previous state
              const newX = waveEditorPos.x + info.offset.x;
              const newY = waveEditorPos.y + info.offset.y;
              setWaveEditorPos({ x: newX, y: newY });
            }}
            initial={{
              opacity: 0,
              scale: 0.9,
              x: waveEditorPos.x,
              y: waveEditorPos.y + 10
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: waveEditorPos.x,
              y: waveEditorPos.y
            }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 10000,
              pointerEvents: "auto"
            }}
          >
            <WaveQuickEditor
              p={selectedBlock.props}
              blockId={selectedBlock.id}
              onClose={() => setWaveEditorPos(null)}
              dragControls={dragControls}
            />
          </motion.div>
        )}

        {textEditorPos && selectedBlock && (
          <motion.div
            key={`global-text-editor`}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={true}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            dragConstraints={dragBounds}
            dragElastic={0}
            onDragEnd={(_, info) => {
              const newX = textEditorPos.x + info.offset.x;
              const newY = textEditorPos.y + info.offset.y;
              setTextEditorPos({ x: newX, y: newY });
            }}
            initial={{
              opacity: 0,
              scale: 0.9,
              x: textEditorPos.x,
              y: textEditorPos.y + 10
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: textEditorPos.x,
              y: textEditorPos.y
            }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 10000,
              pointerEvents: "auto"
            }}
          >
            <TextQuickEditor
              p={selectedBlock.props}
              blockId={selectedBlock.id}
              onClose={() => setTextEditorPos(null)}
              dragControls={dragControls}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

const DropZone = memo(function DropZone({
  blocks,
  routeBlocksLength,
  headerId,
  footerId
}: {
  blocks: Block[],
  routeBlocksLength: number,
  headerId?: string,
  footerId?: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-root" });
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const blockIds = blocks.map((b) => b.id);

  // Track which block is being hovered over
  const [dropInfo, setDropInfo] = useState<{
    overId: string | null;
    position: "before" | "after" | "inside" | "replace";
    isDraggingFromPalette: boolean;
  }>({ overId: null, position: "after", isDraggingFromPalette: false });

  // Track height of the active dragged element for dynamic drop placeholder
  const [activeHeight, setActiveHeight] = useState<number>(80);

  useDndMonitor({
    onDragStart(event) {
      // Capture the actual height of the element being dragged
      const rect = event.active.rect?.current?.initial;
      if (rect) {
        setActiveHeight(Math.max(rect.height, 40));
      }
    },
    onDragMove(event) {
      const { over, active } = event;

      if (!over) {
        setDropInfo({ overId: null, position: "after", isDraggingFromPalette: false });
        return;
      }
      const data = active.data.current as { type?: string; blockType?: string };
      const isPalette = data?.type === "palette" || data?.type === "section";
      let overId = over.id as string;

      const isRootOnly = data?.blockType === "header" || data?.blockType === "footer";
      const colMatch = overId.match(/^col-([01])-(.+)$/);
      const childZoneMatch = overId.match(/^(?:hero|container|wave)-(.+)$/);

      if (isRootOnly) {
        if (colMatch) overId = colMatch[2];
        else if (childZoneMatch) overId = childZoneMatch[1];
      }

      let effectiveOverId = overId;
      if (colMatch) effectiveOverId = colMatch[2];
      else if (childZoneMatch) effectiveOverId = childZoneMatch[1];

      if (!blockIds.includes(effectiveOverId) && effectiveOverId !== "canvas-root") {
        setDropInfo({ overId: null, position: "after", isDraggingFromPalette: isPalette });
        return;
      }

      let position: "before" | "after" | "inside" | "replace" = "after";
      const overRect = over.rect;
      const activeRect = active.rect.current?.translated;

      if (overRect && activeRect) {
        const activeCenterY = activeRect.top + activeRect.height / 2;
        const relativeY = (activeCenterY - overRect.top) / overRect.height;

        const isContainer = ["wave", "hero", "container", "features"].includes(over.data.current?.blockType as string || "");

        if (colMatch || childZoneMatch) {
          if (relativeY < 0.15) position = "before";
          else if (relativeY > 0.85) position = "after";
          else if (relativeY > 0.3 && relativeY < 0.7) position = "replace";
          else position = "inside";
        } else if (relativeY < 0.20) {
          position = "before";
        } else if (relativeY > 0.80) {
          position = "after";
        } else {
          if (isContainer && !isRootOnly) {
            position = "inside";
          } else {
            // Provide a 40% center zone for swapping blocks
            if (relativeY >= 0.3 && relativeY <= 0.7) {
              position = "replace";
            } else {
              position = relativeY < 0.5 ? "before" : "after";
            }
          }
        }
      }

      setDropInfo({ overId: effectiveOverId, position, isDraggingFromPalette: isPalette });
    },
    onDragEnd() {
      setDropInfo({ overId: null, position: "after", isDraggingFromPalette: false });
      setActiveHeight(80);
    },
    onDragCancel() {
      setDropInfo({ overId: null, position: "after", isDraggingFromPalette: false });
      setActiveHeight(80);
    },
  });

  return (
    <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            selectBlock(null);
          }
        }}
        style={{
          minHeight: "inherit",
          transition: "background 0.15s",
          background: isOver && blocks.length === 0 ? "rgba(99,102,241,0.04)" : "transparent",
        }}
      >
        {blocks.length === 0 ? (
          <EmptyState isOver={isOver} />
        ) : (
          <>
            {/* Initial empty state if no header and no content */}
            {(!headerId && routeBlocksLength === 0) && (
              <EmptyState isOver={isOver} />
            )}

            {blocks.map((block, index) => {
              const isFooter = block.id === footerId;
              const isHeader = block.id === headerId;
              const isLast = index === blocks.length - 1;

              // Invitation logic:
              // 1. If route is empty and we just rendered the header, show invitation
              const showInviteEmptyRoute = isHeader && routeBlocksLength === 0;

              // 2. If route has content OR it's a blank page without a header, show before footer
              const showInviteBeforeFooter = isFooter && (routeBlocksLength > 0 || !headerId);
              const showInviteAtBottom = isLast && !footerId && (routeBlocksLength > 0 || !headerId);

              return (
                <React.Fragment key={block.id}>
                  {showInviteBeforeFooter && (
                    <AddSectionInvitation isOver={isOver && dropInfo.overId === "canvas-root"} />
                  )}

                  <CanvasBlock
                    block={block}
                    isDropTarget={dropInfo.overId === block.id}
                    isFirst={index === 0}
                    isDraggingFromPalette={dropInfo.isDraggingFromPalette}
                    activeHeight={activeHeight}
                    dropPosition={dropInfo.position}
                  />

                  {showInviteEmptyRoute && (
                    <div style={{ padding: "40px 0" }}>
                      <AddSectionInvitation isOver={isOver && dropInfo.overId === "canvas-root"} isFirst />
                    </div>
                  )}

                  {showInviteAtBottom && (
                    <AddSectionInvitation isOver={isOver && dropInfo.overId === "canvas-root"} />
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}

        {/* Bottom drop indicator when dragging at the very end */}
        {dropInfo.isDraggingFromPalette && dropInfo.overId === "canvas-root" && (
          <DropIndicator height={activeHeight} />
        )}
      </div>
    </SortableContext>
  );
});

// ─── Drop Indicator ───────────────────────────────────────────────────────────
// Dynamically sized to match the height of the block being dragged

function DropIndicator({ height }: { height: number }) {
  return (
    <div style={{
      height: Math.min(height, 300),
      margin: "4px 16px",
      borderRadius: 8,
      border: "2px dashed #818cf8",
      background: "rgba(99,102,241,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "height 0.2s ease",
    }}>
      <Squares2X2Icon style={{ width: 16, height: 16, color: "#818cf8" }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: "#818cf8", letterSpacing: "0.02em" }}>
        Drop here
      </span>
    </div>
  );
}

// ─── Canvas Block (sortable wrapper) ─────────────────────────────────────────

const CanvasBlock = memo(function CanvasBlock({
  block,
  isDropTarget,
  isFirst,
  isDraggingFromPalette,
  activeHeight,
  dropPosition,
}: {
  block: Block;
  isDropTarget: boolean;
  isFirst: boolean;
  isDraggingFromPalette: boolean;
  activeHeight: number;
  dropPosition: "before" | "after" | "inside" | "replace";
}) {
  const { selectedBlockId, hoveredBlockId, selectBlock, hoverBlock, deleteBlock, duplicateBlock, replaceBlock, page } =
    useEditorStore();

  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;
  const showControls = isSelected || isHovered;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: block.id,
      data: { type: "canvas", blockType: block.type },
    });

  // Enable visual drop indicator for ALL drags (from palette AND from canvas)
  const showDropHighlight = isDropTarget;
  const isBefore = showDropHighlight && dropPosition === "before";
  const isAfter = showDropHighlight && dropPosition === "after";
  const isInside = showDropHighlight && dropPosition === "inside";
  const isReplace = showDropHighlight && dropPosition === "replace";

  return (
    <>
      {/* Drop indicator before the block (when dragged above center) */}
      {isBefore && (
        <DropIndicator height={activeHeight} />
      )}

      <div
        ref={setNodeRef}
        id={block.id}
        style={{
          position: (block.type === "header" && (block.props.position === "fixed" || block.props.isFloating)) ? "fixed" : "relative",
          top: (block.type === "header" && block.props.isFloating) ? ((block.props.floatingTop as string) || "40px") : (block.type === "header" && block.props.position === "fixed") ? 0 : undefined,
          left: (block.type === "header" && block.props.isFloating) ? "50%" : (block.type === "header" && block.props.position === "fixed") ? 0 : undefined,
          transform: (block.type === "header" && block.props.isFloating)
            ? `translateX(-50%) ${CSS.Transform.toString(transform) || ""}`
            : (CSS.Transform.toString(transform) || undefined),
          width: (block.type === "header" && block.props.isFloating) ? ((block.props.floatingWidth as string) || "95%") : "100%",
          maxWidth: (block.type === "header" && block.props.isFloating && block.props.layoutWidth !== "fluid") ? (block.props.layoutWidth === "narrow" ? "800px" : ((page?.theme?.layout?.maxWidth as string) || "1200px")) : "100%",
          zIndex: isSelected ? 150 : ((block.type === "header" && (block.props.position === "fixed" || block.props.isFloating)) ? 10000 : 1),
          transition: transition || undefined,
          opacity: isDragging ? 0.25 : 1,
          boxShadow: isInside
            ? "inset 0 0 0 2px #6366f1, 0 0 15px rgba(99,102,241,0.2)"
            : isReplace
              ? "inset 0 0 0 3px #10b981, 0 0 15px rgba(16,185,129,0.3)"
              : showDropHighlight
                ? "inset 0 0 0 2px rgba(99,102,241,0.25)"
                : undefined,
          borderRadius: block.props.isFloating ? ((block.props.floatingRadius as string) || "16px") : (isInside || isReplace ? 8 : 0),
        }}
        onClick={(e) => {
          e.stopPropagation();
          const isAlreadySelected = useEditorStore.getState().selectedBlockId === block.id;
          selectBlock(block.id);
          // Only scroll if we are selecting a NEW block to avoid jumpiness during minor edits
          if (!isAlreadySelected) {
            e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }}
        onMouseEnter={() => hoverBlock(block.id)}
        onMouseLeave={() => hoverBlock(null)}
      >
        {/* Drop zone label — top or bottom edge */}
        {(isBefore || isAfter) && (
          <div style={{
            position: "absolute",
            top: isBefore ? 0 : undefined,
            bottom: isAfter ? 0 : undefined,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            zIndex: 5,
            boxShadow: "0 0 8px rgba(99,102,241,0.5)",
          }} />
        )}

        {/* Swap visual indicator */}
        {isReplace && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(16,185,129,0.1)",
            zIndex: 99, pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              background: "#10b981", color: "#fff",
              padding: "6px 16px", borderRadius: 99,
              fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.05em",
              boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
            }}>
              Swap Blocks
            </div>
          </div>
        )}

        {/* Inner drop label for containers */}
        {isInside && (
          <div style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#6366f1",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: 99,
            fontSize: 10,
            fontWeight: 700,
            zIndex: 100,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            pointerEvents: "none",
          }}>
            Drop Inside
          </div>
        )}

        {/* Visible selection / hover ring — absolutely positioned ABOVE block content */}
        {(isSelected || isHovered) && !isDragging && (
          <div
            style={{
              position: "absolute", inset: 0,
              border: isSelected ? "2.5px solid #6366f1" : "1.5px solid #94a3b8",
              boxShadow: isSelected ? "inset 0 0 0 1px rgba(99,102,241,0.15), 0 0 0 3px rgba(99,102,241,0.12)" : undefined,
              zIndex: 11000, pointerEvents: "none",
            }}
          />
        )}
        {/* Selected block type badge */}
        {isSelected && (
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            background: "#6366f1", color: "#fff",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            padding: "2px 10px", borderRadius: "0 0 6px 6px",
            zIndex: 11001, pointerEvents: "none", textTransform: "uppercase",
            whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(99,102,241,0.4)",
          }}>
            {block.type}
          </div>
        )}

        {/* Floating action bar — WHITE background for visibility on any block */}
        {showControls && (
          <div className="absolute right-4 p-1 rounded-sm shadow-md bg-white space-x-1 flex items-center" style={{
            zIndex: 11002,
            top: block.type === "header" || block.type === "hero" ? 80 : 10,
          }}>
            <QuickLayoutChange block={block} />

            {/* Quick Media Change */}
            {(() => {
              const info = getBlockMediaInfo(block.type);
              if (!info) return null;

              return (
                <AppToolTip title={`Change ${info.label}`}>
                  <IconButton
                    icon={<info.icon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      useEditorStore.getState().showMediaPicker({
                        type: info.mediaType,
                        title: `Change ${info.label}`,
                        onSelect: (url) => {
                          useEditorStore.getState().updateBlock(block.id, { [info.prop]: url }, true);
                        }
                      });
                    }}
                  />
                </AppToolTip>
              );
            })()}

            {/* Quick Wave Decoration Toggle */}
            {(block.type !== "header") && (
              <AppToolTip title={block.props.showWave ? "Change Wave Decoration" : "Add Wave Decoration"}>
                <IconButton
                  className={block.props.showWave ? "text-indigo-600 bg-indigo-50" : ""}
                  icon={<WaveIcon style={{ width: 14, height: 14 }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    const hasWave = !!block.props.showWave;
                    useEditorStore.getState().updateBlock(block.id, {
                      showWave: !hasWave,
                      // Set sensible defaults if turning ON for the first time
                      ...(!hasWave ? {
                        wavePattern: block.props.wavePattern || "smooth",
                        wavePosition: block.props.wavePosition || "bottom",
                        waveColor: block.props.waveColor || "var(--primary)",
                        waveLayers: block.props.waveLayers ?? 3,
                        waveAnimated: block.props.waveAnimated !== false,
                        waveHeight: block.props.waveHeight || "120px"
                      } : {})
                    }, true);

                    // If turning on, select the block so the user sees the options
                    if (!hasWave) {
                      selectBlock(block.id);
                    }

                    // Auto-focus and scroll to the Wave Decoration section
                    useEditorStore.getState().focusSubItem(block.id, "Wave Decoration");
                  }}
                />
              </AppToolTip>
            )}

            {block.type === "wave" && (
              <AppToolTip title="Flip Orientation">
                <IconButton
                  icon={<ArrowsRightLeftIcon style={{ width: 14, height: 14 }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    const p = block.props;
                    useEditorStore.getState().updateBlock(block.id, {
                      flipHorizontal: !p.flipHorizontal,
                      flipVertical: !p.flipVertical
                    }, true);
                  }}
                />
              </AppToolTip>
            )}

            {/* Drag, Duplicate & Delete*/}
            {(block.type !== "header" && block.type !== "footer") &&
              <>
                {/* Drag to reorder */}
                <AppToolTip title="Drag to reorder">
                  <IconButton
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing"
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="5" r="2" />
                        <circle cx="9" cy="12" r="2" />
                        <circle cx="9" cy="19" r="2" />
                        <circle cx="15" cy="5" r="2" />
                        <circle cx="15" cy="12" r="2" />
                        <circle cx="15" cy="19" r="2" />
                      </svg>
                    }
                  />
                </AppToolTip>

                {/* Duplicate block */}
                <AppToolTip title="Duplicate block">
                  <IconButton icon={<Square2StackIcon style={{ width: 14, height: 14 }} />} onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }} />
                </AppToolTip>
              </>
            }

            {/* Delete block */}
            <AppToolTip title="Delete block">
              <IconButton className="bg-red-500/15" icon={<TrashIcon style={{ width: 14, height: 14 }} />} onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} />
            </AppToolTip>
          </div>
        )}

        <BlockRenderer block={block} />
      </div>

      {/* Drop indicator after the block (when dragged below center) */}
      {isAfter && (
        <DropIndicator height={activeHeight} />
      )}
    </>
  );
});

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ isOver }: { isOver: boolean }) {
  const openBlockPicker = useEditorStore(s => s.openBlockPicker);
  return (
    <div
      onClick={() => openBlockPicker({ id: "canvas-root", position: "after" }, "sections")}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: 400, gap: 12,
        border: `2px dashed ${isOver ? "#6366f1" : "rgba(150,150,150,0.3)"}`,
        margin: 24, borderRadius: 12,
        background: isOver ? "rgba(99,102,241,0.05)" : "rgba(150,150,150,0.02)",
        transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1)",
        cursor: "pointer",
      }}
    >
      <IconButton className="bg-white/40 dark:bg-black/30 transition-all duration-200 ease-in-out hover:bg-white/60 dark:hover:bg-black/40" icon={<PlusIcon style={{ width: 24, height: 24, color: isOver ? "#fff" : "#94a3b8" }} />} />
      <div style={{ textAlign: "center" }}>
        <p style={{
          margin: 0, fontSize: 16,
          color: isOver ? "#6366f1" : "#1e293b",
          fontWeight: 600,
        }}>
          {isOver ? "Drop to add block" : "Starting your page?"}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
          Drag elements from the left to build your layout
        </p>
      </div>
    </div>
  );
}

function AddSectionInvitation({ isOver, isFirst }: { isOver: boolean, isFirst?: boolean }) {
  const openBlockPicker = useEditorStore(s => s.openBlockPicker);
  return (
    <div
      onClick={() =>
        openBlockPicker({ id: "canvas-root", position: "after" }, "sections")
      }
      className={cn(
        "flex flex-col items-center h-56 mx-5 justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
        isFirst ? "mt-4" : "mt-10",
        isOver
          ? "border-indigo-500 bg-indigo-500/5 scale-[1.02]"
          : "border-[rgba(150,150,150,0.2)] bg-transparent",
        "hover:border-indigo-500 hover:bg-indigo-500/5 hover:scale-[1.01]"
      )}
    >
      <PlusIcon className={cn( "w-10 h-10 bg-slate-600 rounded-full p-1", isOver ? "text-indigo-500" : "text-white" )} />
      <span className={cn( "text-[13px] font-semibold tracking-[0.02em]", isOver ? "text-indigo-500" : "text-slate-500")}>
        {isFirst ? "Starting your page...." : "Add a new section"}
      </span>
    </div>
  );
}
