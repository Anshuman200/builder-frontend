"use client";

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { createDefaultBlock, PALETTE_BLOCKS, type BlockType } from "../palette/paletteConfig";
import { CanvasDropZone } from "./CanvasDropZone";
import { ViewportFrame } from "./ViewportFrame";
import { BlockRenderer } from "../blocks/BlockRenderer";
import type { Block } from "@/stores/editorStore";
import { LayoutTemplate } from "lucide-react";

export function EditorCanvas() {
    const { page, addBlock, moveBlock, selectBlock } = useEditorStore();
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [activeDragBlock, setActiveDragBlock] = useState<Block | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const blocks = page?.content ?? [];

    function handleDragStart(event: DragStartEvent) {
        const id = event.active.id as string;
        setActiveDragId(id);

        if (!id.startsWith("palette-")) {
            const block = blocks.find((b) => b.id === id) ?? null;
            setActiveDragBlock(block);
        } else {
            setActiveDragBlock(null);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveDragId(null);
        setActiveDragBlock(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId.startsWith("palette-")) {
            // Drop from palette → create new block
            const blockType = activeId.replace("palette-", "") as BlockType;
            const newBlock = createDefaultBlock(blockType);

            // Insert at position of the over block, or append
            addBlock(newBlock);
            if (overId !== "canvas-root" && !overId.startsWith("col-")) {
                // Move to the dropped position
                const newBlocks = [...blocks, newBlock];
                const activeIdx = newBlocks.findIndex((b) => b.id === newBlock.id);
                const overIdx = newBlocks.findIndex((b) => b.id === overId);
                if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
                    moveBlock(newBlock.id, overId);
                }
            }
        } else if (overId.startsWith("col-")) {
            // Drop into a column — extract parentId and column index
            const parts = overId.split("-"); // "col-{blockId}-{colIndex}"
            const parentId = parts.slice(1, -1).join("-");
            const colIndex = parseInt(parts[parts.length - 1]);
            // For now just add to the parent; column-aware ordering can be enhanced
            const blockToMove = blocks.find((b) => b.id === activeId);
            if (blockToMove && parentId) {
                // Remove from root and add to parent
                // (simplified: just add a clone to the column)
                const clone = JSON.parse(JSON.stringify(blockToMove)) as Block;
                clone.id = crypto.randomUUID();
                addBlock(clone, parentId);
            }
        } else {
            // Canvas reorder
            if (activeId !== overId) {
                moveBlock(activeId, overId);
            }
        }
    }

    const activePaletteConfig = activeDragId?.startsWith("palette-")
        ? PALETTE_BLOCKS.find((c) => c.type === activeDragId.replace("palette-", ""))
        : null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <ViewportFrame>
                <div onClick={() => selectBlock(null)}>
                    <CanvasDropZone blocks={blocks} />
                </div>
            </ViewportFrame>

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                {activePaletteConfig ? (
                    <PaletteDragOverlay config={activePaletteConfig} />
                ) : activeDragBlock ? (
                    <BlockDragOverlay block={activeDragBlock} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function PaletteDragOverlay({ config }: { config: (typeof PALETTE_BLOCKS)[number] }) {
    const Icon = config.icon;
    return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600/90 backdrop-blur border border-indigo-400/30 shadow-xl text-white min-w-[180px]">
            <div className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center shrink-0">
                <Icon size={14} />
            </div>
            <span className="text-sm font-medium">{config.label}</span>
        </div>
    );
}

function BlockDragOverlay({ block }: { block: Block }) {
    return (
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden opacity-90 min-w-[300px] pointer-events-none">
            <BlockRenderer block={block} />
        </div>
    );
}
