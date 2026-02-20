"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { useEditorStore, Block } from "@/stores/editorStore";
import { BlockRenderer } from "./blocks/BlockRenderer";

const WIDTH_MAP = {
  desktop: "100%",
  tablet: 768,
  mobile: 390,
};

export function Canvas() {
  const {
    page, selectedBlockId, hoveredBlockId,
    selectBlock, hoverBlock, moveBlock,
    viewMode,
  } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveBlock(String(active.id), String(over.id));
    }
  };

  const blocks = page?.content ?? [];
  const canvasWidth = WIDTH_MAP[viewMode];

  return (
    <div
      style={{
        flex: 1,
        marginLeft: 220,
        marginRight: 280,
        marginTop: 52,
        background: "var(--bg-secondary)",
        minHeight: "calc(100vh - 52px)",
        display: "flex",
        justifyContent: "center",
        padding: "2rem 1rem",
        overflowY: "auto",
      }}
      onClick={() => selectBlock(null)}
    >
      {/* Canvas frame */}
      <div
        style={{
          width: canvasWidth,
          minHeight: 600,
          background: "var(--bg)",
          boxShadow: "0 0 0 1px var(--border), var(--shadow-xl)",
          borderRadius: viewMode !== "desktop" ? "var(--radius-lg)" : "var(--radius)",
          transition: "width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {blocks.length === 0 ? (
          <EmptyCanvas />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map(block => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  selected={selectedBlockId === block.id}
                  hovered={hoveredBlockId === block.id}
                  onSelect={selectBlock}
                  onHover={hoverBlock}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function SortableBlock({
  block, selected, hovered, onSelect, onHover,
}: {
  block: Block;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag handle */}
      {(selected || hovered) && (
        <div
          {...attributes}
          {...listeners}
          style={{
            position: "absolute",
            left: -28,
            top: "50%",
            transform: "translateY(-50%)",
            padding: "4px",
            cursor: "grab",
            color: "var(--text-subtle)",
            zIndex: 10,
            background: "var(--surface)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            display: "flex",
          }}
        >
          <GripVertical size={14} />
        </div>
      )}
      <BlockRenderer
        block={block}
        selected={selected}
        hovered={hovered}
        onSelect={onSelect}
        onHover={onHover}
      />
    </div>
  );
}

function EmptyCanvas() {
  const addBlock = useEditorStore(s => s.addBlock);

  const addHero = (e: React.MouseEvent) => {
    e.stopPropagation();
    addBlock({
      id: `block_${Date.now()}`,
      type: "hero",
      props: {
        heading: "Your Headline Here",
        subheading: "A compelling description of your product or service.",
        ctaText: "Get Started",
        ctaHref: "#",
        align: "center",
        bgColor: "linear-gradient(135deg, #0f0f23, #1a0533)",
        textColor: "#ffffff",
        ctaColor: "#6366f1",
      },
    });
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: 500, padding: "3rem 2rem", textAlign: "center", gap: "1.25rem",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "var(--radius-lg)",
        background: "var(--primary-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Plus size={24} color="var(--primary)" />
      </div>
      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>
          Start building your page
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
          Add blocks from the panel on the left, or start with a hero section.
        </p>
      </div>
      <button
        onClick={addHero}
        style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          padding: "0.6rem 1.25rem",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "white", border: "none", borderRadius: "var(--radius)",
          fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
        }}
      >
        <Plus size={15} /> Add Hero Section
      </button>
    </div>
  );
}
