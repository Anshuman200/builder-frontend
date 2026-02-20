"use client";

import { Block } from "@/stores/editorStore";

interface DividerProps {
  style?: "solid" | "dashed" | "dotted";
  color?: string;
  thickness?: number;
  width?: number;
  align?: "left" | "center" | "right";
}

export function DividerBlock({ block }: { block: Block }) {
  const p = block.props as DividerProps;
  const color = p.color ?? "var(--border)";
  const thickness = p.thickness ?? 1;
  const width = p.width ?? 100;
  const style = p.style ?? "solid";
  const align = p.align ?? "center";

  const justifyMap = { left: "flex-start", center: "center", right: "flex-end" };

  return (
    <div style={{ padding: "0.75rem 2rem", display: "flex", justifyContent: justifyMap[align] }}>
      <hr style={{
        width: `${width}%`,
        height: 0,
        border: "none",
        borderTop: `${thickness}px ${style} ${color}`,
        margin: 0,
      }} />
    </div>
  );
}
