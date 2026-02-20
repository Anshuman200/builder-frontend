"use client";

import { Block } from "@/stores/editorStore";

interface ButtonProps {
  label?: string;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
  color?: string;
}

const sizeMap = {
  sm: { padding: "0.5rem 1.25rem", fontSize: "0.8rem" },
  md: { padding: "0.75rem 1.75rem", fontSize: "0.95rem" },
  lg: { padding: "0.9rem 2.25rem", fontSize: "1.1rem" },
};

export function ButtonBlock({ block }: { block: Block }) {
  const p = block.props as ButtonProps;
  const align = p.align ?? "center";
  const size = sizeMap[p.size ?? "md"];
  const color = p.color ?? "#6366f1";

  const justifyMap = { left: "flex-start", center: "center", right: "flex-end" };

  const getStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      ...size,
      borderRadius: 999,
      fontWeight: 700,
      cursor: "pointer",
      border: "2px solid transparent",
      textDecoration: "none",
      display: "inline-block",
      transition: "all 0.2s",
    };
    switch (p.variant) {
      case "secondary":
        return { ...base, background: `${color}22`, color, borderColor: "transparent" };
      case "outline":
        return { ...base, background: "transparent", color, borderColor: color };
      case "ghost":
        return { ...base, background: "transparent", color, borderColor: "transparent" };
      default:
        return { ...base, background: color, color: "white", boxShadow: `0 4px 20px ${color}55` };
    }
  };

  return (
    <div style={{ padding: "1rem 2rem", display: "flex", justifyContent: justifyMap[align] }}>
      <a href={p.href ?? "#"} style={getStyle()} onClick={e => e.preventDefault()}>
        {p.label ?? "Click me"}
      </a>
    </div>
  );
}
