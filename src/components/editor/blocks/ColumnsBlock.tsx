"use client";

import { Block } from "@/stores/editorStore";
import { BlockRenderer } from "./BlockRenderer";

interface ColumnsProps {
  columns?: 2 | 3 | 4;
  gap?: number;
  columnBlocks?: Block[][];
}

export function ColumnsBlock({ block, preview }: { block: Block; preview?: boolean }) {
  const p = block.props as ColumnsProps;
  const cols = p.columns ?? 2;
  const gap = p.gap ?? 24;
  const colBlocks: Block[][] = p.columnBlocks ?? Array.from({ length: cols }, () => []);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
      padding: "1rem 2rem",
    }}>
      {Array.from({ length: cols }, (_, i) => (
        <div key={i} style={{
          minHeight: 80,
          background: "transparent",
          border: preview ? "none" : "1px dashed var(--border)",
          borderRadius: "var(--radius)",
        }}>
          {(colBlocks[i] ?? []).map(childBlock => (
            <BlockRenderer key={childBlock.id} block={childBlock} preview={preview} />
          ))}
          {!preview && (colBlocks[i] ?? []).length === 0 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 80, color: "var(--text-subtle)", fontSize: "0.75rem",
            }}>
              Column {i + 1}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
