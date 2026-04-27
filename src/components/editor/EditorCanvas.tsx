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
import { EllipsisHorizontalIcon, TrashIcon, Square2StackIcon, PlusIcon, Squares2X2Icon, ArrowsPointingOutIcon, PhotoIcon, VideoCameraIcon, ViewColumnsIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { applyThemeToElement, DEFAULT_THEME } from "@/lib/utils/theme";
import { BlockRenderer } from "./blocks";
import { ActivePathContext, PreviewContext, getBlockMediaInfo, getBlockLayouts } from "./blocks/shared";
import { IconButton } from "../ui/IconButton";
import AppToolTip from "../common/AppToolTip";

// Viewport widths per mode
const VIEWPORT_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
} as const;

// ─── Main Canvas ──────────────────────────────────────────────────────────────

export default function EditorCanvas() {
  const { page, viewMode, selectBlock, updateTheme, activeRouteId } = useEditorStore();

  const activeRoute = page?.routes?.find(r => r.id === activeRouteId);
  const routeBlocks = activeRoute?.content ?? [];

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

  // Apply theme object to CSS variables on mount and whenever theme changes
  React.useEffect(() => {
    if (!canvasRef.current) return;
    applyThemeToElement(canvasRef.current, page?.theme || DEFAULT_THEME);
  }, [page?.theme]);

  return (
    // Outer scroll area
    <div
      id="editor-scroll-container"
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
          minHeight: "calc(100vh - 100px)",
          background: "var(--background)",
          color: "var(--text)",
          boxShadow: isConstrained ? "0 4px 24px rgba(0,0,0,0.15)" : "none",
          borderRadius: isConstrained ? 8 : 0,
          overflow: "clip",
          transition: "width 0.25s ease, background 0.3s ease",
          flexShrink: 0,
          position: "relative",
          transform: "translateZ(0)", // Confines position:fixed children to canvas bounds
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
            headerId={page?.globalBlocks?.header?.id}
            footerId={page?.globalBlocks?.footer?.id}
          />
        </ActivePathContext.Provider>
      </div>

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
  const { selectBlock } = useEditorStore();
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
          paddingBottom: 200,
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
  const { selectedBlockId, hoveredBlockId, selectBlock, hoverBlock, deleteBlock, duplicateBlock } =
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
          position: "relative",
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.25 : 1,
          boxShadow: isInside
            ? "inset 0 0 0 2px #6366f1, 0 0 15px rgba(99,102,241,0.2)"
            : isReplace
              ? "inset 0 0 0 3px #10b981, 0 0 15px rgba(16,185,129,0.3)"
              : showDropHighlight
                ? "inset 0 0 0 2px rgba(99,102,241,0.25)"
                : undefined,
          borderRadius: isInside || isReplace ? 8 : 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectBlock(block.id);
          e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
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
              zIndex: 9998, pointerEvents: "none",
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
            zIndex: 9999, pointerEvents: "none", textTransform: "uppercase",
            whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(99,102,241,0.4)",
          }}>
            {block.type}
          </div>
        )}

        {/* Floating action bar — WHITE background for visibility on any block */}
        {showControls && (
          <div className="absolute top-4 right-4 p-1 rounded-sm shadow-md bg-white z-100 space-x-1 flex items-center">
            {/* Quick Layout Change */}
            {(() => {
              const layouts = getBlockLayouts(block.type);
              if (!layouts) return null;

              return (
                <AppToolTip title="Change Layout">
                  <IconButton
                    icon={<ViewColumnsIcon style={{ width: 14, height: 14 }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      const current = (block.props.layout as string) || layouts[0];
                      const idx = layouts.indexOf(current);
                      const next = layouts[(idx + 1) % layouts.length];
                      useEditorStore.getState().updateBlock(block.id, { layout: next }, true);
                    }}
                  />
                </AppToolTip>
              );
            })()}

            {/* Quick Media Change */}
            {(() => {
              const info = getBlockMediaInfo(block.type);
              if (!info) return null;

              return (
                <AppToolTip title={`Change ${info.label}`}>
                  <IconButton
                    icon={<info.icon style={{ width: 14, height: 14 }} />}
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

            {/* Drag, Duplicate & Delete*/}
            {(block.type !== "header" && block.type !== "footer") &&
              <>
                {/* Drag to reorder */}
                <AppToolTip title="Drag to reorder">
                  <IconButton {...attributes} {...listeners} icon={<ArrowsPointingOutIcon style={{ width: 14, height: 14 }} />} />
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
      className={`
    mx-6 ${isFirst ? 'mt-4' : 'mt-10'} mb-10 p-6
    flex flex-col items-center justify-center gap-2
    rounded-xl border-2 border-dashed cursor-pointer
    transition-all duration-200

    ${isOver
          ? "border-indigo-500 bg-indigo-500/5 rotate-0 scale-[1.02]"
          : "border-[rgba(150,150,150,0.2)] bg-transparent"
        }

    hover:border-indigo-500 hover:bg-indigo-500/5 hover:scale-[1.01]
  `}
    >
      <PlusIcon className={`w-5 h-5 ${isOver ? "text-indigo-500" : "text-slate-400"}`} />
      <span className={`text-[13px] font-semibold tracking-[0.02em] ${isOver ? "text-indigo-500" : "text-slate-500"}`}>
        {isFirst ? "Add your first section" : "Add more sections"}
      </span>
    </div>
  );
}
