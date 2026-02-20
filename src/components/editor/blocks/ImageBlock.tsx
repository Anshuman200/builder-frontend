"use client";

import { Block } from "@/stores/editorStore";
import { ImageIcon } from "lucide-react";

interface ImageProps {
  src?: string;
  alt?: string;
  fit?: "cover" | "contain" | "fill";
  height?: number;
  align?: "left" | "center" | "right";
  borderRadius?: number;
}

export function ImageBlock({ block }: { block: Block }) {
  const p = block.props as ImageProps;
  const align = p.align ?? "center";
  const height = p.height ?? 300;
  const fit = p.fit ?? "cover";
  const br = p.borderRadius ?? 0;

  const justifyMap = { left: "flex-start", center: "center", right: "flex-end" };

  return (
    <div style={{ padding: "0.5rem 2rem", display: "flex", justifyContent: justifyMap[align] }}>
      {p.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.src}
          alt={p.alt ?? ""}
          style={{
            width: "100%", height, objectFit: fit,
            borderRadius: br, display: "block",
          }}
        />
      ) : (
        <div style={{
          width: "100%", height,
          background: "var(--surface)",
          border: "2px dashed var(--border)",
          borderRadius: br,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: "0.5rem",
          color: "var(--text-muted)",
        }}>
          <ImageIcon size={32} />
          <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>No image selected</span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>Set image URL in properties panel</span>
        </div>
      )}
    </div>
  );
}
