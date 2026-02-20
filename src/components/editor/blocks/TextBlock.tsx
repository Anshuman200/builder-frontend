"use client";

import { Block } from "@/stores/editorStore";

interface TextProps {
  text?: string;
  align?: "left" | "center" | "right";
  color?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "0.875rem", md: "1rem", lg: "1.125rem" };

export function TextBlock({ block }: { block: Block }) {
  const p = block.props as TextProps;

  return (
    <div style={{ padding: "0.75rem 2rem" }}>
      <p style={{
        margin: 0,
        textAlign: p.align ?? "left",
        color: p.color ?? "var(--text-muted)",
        fontSize: sizeMap[p.size ?? "md"],
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
      }}>
        {p.text ?? "Add your text here. Click to edit this block."}
      </p>
    </div>
  );
}
