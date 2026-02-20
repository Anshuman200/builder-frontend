"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, LayoutTemplate } from "lucide-react";
import { useEditorStore, type Block } from "@/stores/editorStore";
import { createBlock } from "@/lib/blockConfig";
import { BlockRenderer } from "./blocks";

// Viewport widths per mode
const VIEWPORT_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
} as const;

// ─── Main Canvas ──────────────────────────────────────────────────────────────

export default function EditorCanvas() {
  const { page, viewMode, addBlock, moveBlock, selectBlock } = useEditorStore();
  const blocks = page?.content ?? [];

  // Track what's being dragged for the DragOverlay
  const [activeDrag, setActiveDrag] = useState<{
    type: "palette" | "canvas";
    blockType?: string;
    block?: Block;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { type: "palette" | "canvas"; blockType?: string };
    if (data.type === "palette") {
      setActiveDrag({ type: "palette", blockType: data.blockType });
    } else {
      const block = blocks.find((b) => b.id === event.active.id);
      setActiveDrag({ type: "canvas", block });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current as { type: "palette" | "canvas"; blockType?: string };

    if (data.type === "palette" && data.blockType) {
      // Palette → canvas: create and append, then move if dropped on a specific block
      const newBlock = createBlock(data.blockType);
      addBlock(newBlock);
      if (over.id !== "canvas-root") {
        moveBlock(newBlock.id, over.id as string);
      }
      selectBlock(newBlock.id);
    } else if (data.type === "canvas") {
      // Canvas → reorder
      if (active.id !== over.id) {
        moveBlock(active.id as string, over.id as string);
      }
    }
  }

  const isConstrained = viewMode !== "desktop";
  const canvasWidth = VIEWPORT_WIDTHS[viewMode];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Outer scroll area */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          background: "var(--bg)",
          padding: isConstrained ? "24px 16px" : 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={() => selectBlock(null)}
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

        {/* White page canvas */}
        <div
          style={{
            width: canvasWidth,
            minHeight: "calc(100vh - 100px)",
            background: "#ffffff",
            boxShadow: isConstrained ? "0 4px 24px rgba(0,0,0,0.15)" : "none",
            borderRadius: isConstrained ? 8 : 0,
            overflow: "hidden",
            transition: "width 0.25s ease",
            flexShrink: 0,
          }}
        >
          <DropZone blocks={blocks} />
        </div>
      </div>

      {/* Drag overlay — ghost preview */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeDrag?.type === "palette" && activeDrag.blockType && (
          <PaletteDragGhost blockType={activeDrag.blockType} />
        )}
        {activeDrag?.type === "canvas" && activeDrag.block && (
          <div style={{
            background: "#fff",
            border: "2px solid var(--primary)",
            borderRadius: 6,
            opacity: 0.9,
            pointerEvents: "none",
            minWidth: 200,
          }}>
            <BlockRenderer block={activeDrag.block} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({ blocks }: { blocks: Block[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-root" });
  const blockIds = blocks.map((b) => b.id);

  return (
    <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        style={{
          minHeight: "inherit",
          transition: "background 0.15s",
          background: isOver && blocks.length === 0 ? "rgba(99,102,241,0.04)" : "transparent",
        }}
      >
        {blocks.length === 0 ? (
          <EmptyState isOver={isOver} />
        ) : (
          blocks.map((block) => (
            <CanvasBlock key={block.id} block={block} />
          ))
        )}
      </div>
    </SortableContext>
  );
}

// ─── Canvas Block (sortable wrapper) ─────────────────────────────────────────

function CanvasBlock({ block }: { block: Block }) {
  const { selectedBlockId, hoveredBlockId, selectBlock, hoverBlock, deleteBlock } =
    useEditorStore();

  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;
  const showControls = isSelected || isHovered;

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id: block.id,
    data: { type: "canvas" },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "relative",
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        outline: isSelected
          ? "2px solid #6366f1"
          : isHovered
          ? "1px solid #a5b4fc"
          : "1px solid transparent",
        outlineOffset: -1,
      }}
      onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
      onMouseEnter={() => hoverBlock(block.id)}
      onMouseLeave={() => hoverBlock(null)}
    >
      {/* Floating action bar */}
      {showControls && (
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          display: "flex",
          gap: 2,
          padding: 3,
          background: "#6366f1",
          borderRadius: "0 0 0 6px",
          zIndex: 10,
        }}>
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            title="Drag to reorder"
            style={{
              width: 24, height: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", cursor: "grab",
              color: "rgba(255,255,255,0.8)", borderRadius: 4,
            }}
          >
            <GripVertical size={13} />
          </button>
          {/* Delete */}
          <button
            title="Delete block"
            onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
            style={{
              width: 24, height: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.8)", borderRadius: 4,
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      <BlockRenderer block={block} />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ isOver }: { isOver: boolean }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 400,
      gap: 12,
      border: `2px dashed ${isOver ? "#6366f1" : "#e2e8f0"}`,
      margin: 24,
      borderRadius: 10,
      background: isOver ? "rgba(99,102,241,0.04)" : "transparent",
      transition: "all 0.15s",
    }}>
      <LayoutTemplate size={28} color={isOver ? "#6366f1" : "#cbd5e1"} />
      <p style={{
        margin: 0,
        fontSize: 14,
        color: isOver ? "#6366f1" : "#94a3b8",
        fontWeight: 500,
      }}>
        {isOver ? "Drop to add block" : "Drag a block to get started"}
      </p>
    </div>
  );
}

// ─── Palette Drag Ghost ───────────────────────────────────────────────────────

function PaletteDragGhost({ blockType }: { blockType: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 14px",
      background: "#6366f1",
      color: "#fff",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
      pointerEvents: "none",
    }}>
      {blockType}
    </div>
  );
}
