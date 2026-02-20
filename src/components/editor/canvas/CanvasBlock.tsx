"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Copy } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { BlockRenderer } from "../blocks/BlockRenderer";
import { cn } from "@/lib/utils";
import type { Block } from "@/stores/editorStore";

interface CanvasBlockProps {
    block: Block;
}

export function CanvasBlock({ block }: CanvasBlockProps) {
    const { selectedBlockId, hoveredBlockId, selectBlock, hoverBlock, deleteBlock, addBlock } =
        useEditorStore();

    const isSelected = selectedBlockId === block.id;
    const isHovered = hoveredBlockId === block.id;

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
        opacity: isDragging ? 0.35 : 1,
    };

    function handleDuplicate(e: React.MouseEvent) {
        e.stopPropagation();
        const clone = JSON.parse(JSON.stringify(block));
        clone.id = crypto.randomUUID();
        addBlock(clone);
    }

    function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        deleteBlock(block.id);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                selectBlock(block.id);
            }}
            onMouseEnter={() => hoverBlock(block.id)}
            onMouseLeave={() => hoverBlock(null)}
            className={cn(
                "relative group transition-all",
                isSelected
                    ? "outline outline-2 outline-indigo-500"
                    : isHovered
                    ? "outline outline-1 outline-indigo-400/50"
                    : "outline-0"
            )}
        >
            {/* Drag handle — appears on hover/selection */}
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full",
                    "flex items-center justify-center w-6 h-8 cursor-grab active:cursor-grabbing",
                    "bg-indigo-600/80 backdrop-blur rounded-l-md text-white",
                    "transition-opacity z-10",
                    isSelected || isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
            >
                <GripVertical size={12} />
            </div>

            {/* Action toolbar — top-right on selection */}
            {(isSelected || isHovered) && (
                <div className="absolute top-1 right-1 z-20 flex gap-0.5 bg-indigo-600/90 backdrop-blur rounded-md px-1 py-1">
                    <button
                        title="Duplicate"
                        onClick={handleDuplicate}
                        className="h-5 w-5 flex items-center justify-center rounded text-white/70 hover:text-white hover:bg-white/15 transition-all"
                    >
                        <Copy size={11} />
                    </button>
                    <button
                        title="Delete"
                        onClick={handleDelete}
                        className="h-5 w-5 flex items-center justify-center rounded text-white/70 hover:text-red-300 hover:bg-white/15 transition-all"
                    >
                        <Trash2 size={11} />
                    </button>
                </div>
            )}

            <BlockRenderer block={block} />
        </div>
    );
}
