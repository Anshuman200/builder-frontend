"use client";

import type { Block, BlockStyle } from "@/stores/editorStore";
import { useEditorStore } from "@/stores/editorStore";
import { BlockRenderer } from "./BlockRenderer";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

const RATIO_TO_FRACTIONS: Record<string, string> = {
    "1:1": "1fr 1fr",
    "1:2": "1fr 2fr",
    "2:1": "2fr 1fr",
    "1:3": "1fr 3fr",
    "3:1": "3fr 1fr",
};

interface ColumnsBlockProps {
    block: Block;
    style: BlockStyle;
}

function ColumnDropZone({
    blockId,
    colIndex,
    children,
}: {
    blockId: string;
    colIndex: number;
    children: React.ReactNode;
}) {
    const dropId = `col-${blockId}-${colIndex}`;
    const { setNodeRef, isOver } = useDroppable({ id: dropId });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "min-h-[120px] rounded-lg transition-colors",
                isOver
                    ? "bg-indigo-500/8 outline-2 outline-dashed outline-indigo-500/30"
                    : "bg-black/2"
            )}
        >
            {children}
        </div>
    );
}

export function ColumnsBlock({ block, style }: ColumnsBlockProps) {
    const p = block.props as Record<string, string | number | boolean>;
    const ratio = (p.ratio as string) || "1:1";
    const gap = Number(p.gap) || 24;
    const { viewMode } = useEditorStore();

    const columns = RATIO_TO_FRACTIONS[ratio] || "1fr 1fr";
    const isStacked = viewMode === "mobile" && p.stackMobile !== false;

    // Children are split: even indices → col 0, odd → col 1
    const allChildren = block.children ?? [];
    const col0 = allChildren.filter((_, i) => i % 2 === 0);
    const col1 = allChildren.filter((_, i) => i % 2 === 1);

    return (
        <div
            style={{
                padding: style.padding ?? "32px 24px",
                margin: style.margin,
                background: style.background,
            }}
        >
            <div
                style={{
                    display: isStacked ? "flex" : "grid",
                    flexDirection: isStacked ? "column" : undefined,
                    gridTemplateColumns: isStacked ? undefined : columns,
                    gap,
                }}
            >
                <ColumnDropZone blockId={block.id} colIndex={0}>
                    {col0.length > 0 ? (
                        col0.map((child) => (
                            <BlockRenderer key={child.id} block={child} />
                        ))
                    ) : (
                        <ColumnPlaceholder label="Column 1" />
                    )}
                </ColumnDropZone>

                <ColumnDropZone blockId={block.id} colIndex={1}>
                    {col1.length > 0 ? (
                        col1.map((child) => (
                            <BlockRenderer key={child.id} block={child} />
                        ))
                    ) : (
                        <ColumnPlaceholder label="Column 2" />
                    )}
                </ColumnDropZone>
            </div>
        </div>
    );
}

function ColumnPlaceholder({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[120px] text-black/20 gap-2 rounded-lg border-2 border-dashed border-black/8">
            <span className="text-xs">{label}</span>
            <span className="text-[10px]">Drop blocks here</span>
        </div>
    );
}
