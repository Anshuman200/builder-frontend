"use client";

import { Block } from "@/stores/editorStore";

interface HeadingProps {
  text?: string;
  level?: "h1" | "h2" | "h3" | "h4";
  align?: "left" | "center" | "right";
  color?: string;
}

const sizeMap = {
  h1: { fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em" },
  h2: { fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.02em" },
  h3: { fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.015em" },
  h4: { fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.01em" },
};

export function HeadingBlock({ block }: { block: Block }) {
  const p = block.props as HeadingProps;
  const level = p.level ?? "h2";
  const Tag = level;
  const sizes = sizeMap[level];

  return (
    <div style={{ padding: "1rem 2rem" }}>
      <Tag style={{
        ...sizes,
        textAlign: p.align ?? "left",
        color: p.color ?? "var(--text)",
        margin: 0,
        lineHeight: 1.2,
      }}>
        {p.text ?? "Heading"}
      </Tag>
    </div>
  );
}
