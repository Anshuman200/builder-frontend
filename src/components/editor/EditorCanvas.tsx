"use client";

import type { Block } from "@/@Types";
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
import { EllipsisHorizontalIcon, TrashIcon, Squares2X2Icon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { applyThemeToElement, DEFAULT_THEME } from "@/lib/utils/theme";
import { BlockRenderer } from "./blocks";


// Viewport widths per mode
const VIEWPORT_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
} as const;

// ─── Main Canvas ──────────────────────────────────────────────────────────────

export default function EditorCanvas() {
  const { page, viewMode, selectBlock, updateTheme } = useEditorStore();
  const blocks = page?.content ?? [];
  const themeMode = page?.theme?.mode || "light";
  const isDark = themeMode === "dark";

  const isConstrained = viewMode !== "desktop";
  const canvasWidth = VIEWPORT_WIDTHS[viewMode];

  const toggleTheme = () => {
    updateTheme({ mode: isDark ? "light" : "dark" });
  };

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
        className={isDark ? "dark" : undefined}
        style={{
          width: canvasWidth,
          minHeight: "calc(100vh - 100px)",
          background: isDark ? "#09090b" : "#ffffff",
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
        <DropZone blocks={blocks} />
      </div>

      {/* Floating theme toggle FAB — centered at bottom of scroll area */}
      <div
        style={{
          position: "sticky",
          bottom: 24,
          zIndex: 200,
          display: "flex",
          justifyContent: "center",
          width: "100%",
          pointerEvents: "none",
          marginTop: -56, // Pull up into view without adding scroll height
        }}
      >
        <button
          onClick={toggleTheme}
          title={`Switch canvas to ${isDark ? "Light" : "Dark"} Mode`}
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 999,
            background: isDark
              ? "linear-gradient(135deg, #27272a, #3f3f46)"
              : "linear-gradient(135deg, #ffffff, #f1f5f9)",
            color: isDark ? "#fafafa" : "#0f172a",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.1)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.01em",
            transition: "all 0.2s ease",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.22), 0 4px 8px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.1)";
          }}
        >
          {isDark ? <SunIcon style={{ width: 15, height: 15 }} /> : <MoonIcon style={{ width: 15, height: 15 }} />}
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

const DropZone = memo(function DropZone({ blocks }: { blocks: Block[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-root" });
  const { selectBlock } = useEditorStore();
  const blockIds = blocks.map((b) => b.id);

  // Track which block is being hovered over
  const [dropInfo, setDropInfo] = useState<{
    overId: string | null;
    position: "before" | "after";
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

      const isRootOnly = data?.type === "section" || data?.blockType === "header" || data?.blockType === "footer" || data?.blockType === "hero" || data?.blockType === "features";
      const colMatch = overId.match(/^col-([01])-(.+)$/);
      const childZoneMatch = overId.match(/^(?:hero|container|wave)-(.+)$/);

      if (isRootOnly) {
        if (colMatch) overId = colMatch[2];
        else if (childZoneMatch) overId = childZoneMatch[1];
      }

      if (!blockIds.includes(overId) && overId !== "canvas-root") {
        setDropInfo({ overId: null, position: "after", isDraggingFromPalette: isPalette });
        return;
      }

      let position: "before" | "after" = "after";
      const overRect = over.rect;
      const activeRect = active.rect.current?.translated;

      if (overRect && activeRect) {
        const overCenterY = overRect.top + overRect.height / 2;
        const activeCenterY = activeRect.top + activeRect.height / 2;
        position = activeCenterY < overCenterY ? "before" : "after";
      }

      setDropInfo({ overId, position, isDraggingFromPalette: isPalette });
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
          blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              <CanvasBlock
                block={block}
                isDropTarget={dropInfo.overId === block.id}
                isFirst={index === 0}
                isDraggingFromPalette={dropInfo.isDraggingFromPalette}
                activeHeight={activeHeight}
                dropPosition={dropInfo.position}
              />
            </React.Fragment>
          ))
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
  dropPosition: "before" | "after";
}) {
  const { selectedBlockId, hoveredBlockId, selectBlock, hoverBlock, deleteBlock } =
    useEditorStore();

  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;
  const showControls = isSelected || isHovered;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: block.id,
      data: { type: "canvas", blockType: block.type },
    });

  const showDropHighlight = isDropTarget && isDraggingFromPalette;
  const isBefore = showDropHighlight && dropPosition === "before";
  const isAfter = showDropHighlight && dropPosition === "after";

  return (
    <>
      {/* Drop indicator before the block (when dragged above center) */}
      {isBefore && (
        <DropIndicator height={activeHeight} />
      )}

      <div
        ref={setNodeRef}
        style={{
          position: "relative",
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.25 : 1,
          boxShadow: showDropHighlight
            ? "inset 0 0 0 2px rgba(99,102,241,0.45)"
            : undefined,
        }}
        onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
        onMouseEnter={() => hoverBlock(block.id)}
        onMouseLeave={() => hoverBlock(null)}
      >
        {/* Drop zone label — top or bottom edge */}
        {showDropHighlight && (
          <div style={{
            position: "absolute",
            top: isBefore ? 0 : undefined,
            bottom: isAfter ? 0 : undefined,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            zIndex: 5,
            boxShadow: "0 0 8px rgba(99,102,241,0.5)",
          }} />
        )}

        {/* Outline overlay — use inset box-shadow so it's not clipped by overflow:hidden */}
        {(isSelected || isHovered) && (
          <div style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 60,
            boxShadow: isSelected
              ? "inset 0 0 0 2px #0ea5e9"
              : "inset 0 0 0 1px #94a3b8",
            borderRadius: "2px",
          }} />
        )}

        {/* Floating action bar — WHITE background for visibility on any block */}
        {showControls && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            display: "flex", gap: 2, padding: 3,
            background: "#ffffff", borderRadius: 8, zIndex: 90,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
          }}>
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              title="Drag to reorder"
              style={{
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "none", border: "none", cursor: "grab",
                color: "#475569", borderRadius: 6,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
            >
              <EllipsisHorizontalIcon style={{ width: 15, height: 15 }} />
            </button>
            {/* Delete */}
            <button
              title="Delete block"
              onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
              style={{
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "none", border: "none", cursor: "pointer",
                color: "#ef4444", borderRadius: 6,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
            >
              <TrashIcon style={{ width: 15, height: 15 }} />
            </button>
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
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 400, gap: 12,
      border: `2px dashed ${isOver ? "#6366f1" : "#e2e8f0"}`,
      margin: 24, borderRadius: 10,
      background: isOver ? "rgba(99,102,241,0.04)" : "transparent",
      transition: "all 0.15s",
    }}>
      <Squares2X2Icon style={{ width: 28, height: 28, color: isOver ? "#6366f1" : "#cbd5e1" }} />
      <p style={{
        margin: 0, fontSize: 14,
        color: isOver ? "#6366f1" : "#94a3b8",
        fontWeight: 500,
      }}>
        {isOver ? "Drop to add block" : "Drag a block to get started"}
      </p>
    </div>
  );
}
