"use client";

import React from "react";
import type { Block } from "@/types";
import { PreviewContext, type BlockProps } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { DEFAULT_THEME } from "@/lib/utils/theme";

const WAVE_PATHS = {
  smooth: [
    "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,176C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
  ],
  sharp: [
    "M0,224L120,192L240,256L360,160L480,192L600,128L720,224L840,192L960,256L1080,160L1200,192L1320,128L1440,224L1440,320L1320,320L1200,320L1080,320L960,320L840,320L720,320L600,320L480,320L360,320L240,320L120,320L0,320Z",
    "M0,160L120,192L240,128L360,224L480,160L600,192L720,128L840,224L960,160L1080,192L1200,128L1320,224L1440,160L1440,320L1320,320L1200,320L1080,320L960,320L840,320L720,320L600,320L480,320L360,320L240,320L120,320L0,320Z",
    "M0,96L120,128L240,64L360,160L480,96L600,128L720,64L840,160L960,96L1080,128L1200,64L1320,160L1440,96L1440,320L1320,320L1200,320L1080,320L960,320L840,320L720,320L600,320L480,320L360,320L240,320L120,320L0,320Z"
  ],
  stepped: [
    "M0,160L0,192L288,192L288,128L576,128L576,224L864,224L864,96L1152,96L1152,256L1440,256L1440,320L1152,320L1152,320L864,320L864,320L576,320L576,320L288,320L288,320L0,320L0,320Z",
    "M0,96L0,128L288,128L288,64L576,64L576,160L864,160L864,32L1152,32L1152,192L1440,192L1440,320L1152,320L1152,320L864,320L864,320L576,320L576,320L288,320L288,320L0,320L0,320Z",
    "M0,224L0,256L288,256L288,192L576,192L576,288L864,288L864,160L1152,160L1152,320L1440,320L1440,320L1152,320L1152,320L864,320L864,320L576,320L576,320L288,320L288,320L0,320L0,320Z"
  ],
  asymmetric: [
    "M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,128C1120,107,1280,117,1360,122.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z",
    "M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,218.7C840,213,960,171,1080,154.7C1200,139,1320,149,1380,154.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z",
    "M0,96L120,117.3C240,139,480,181,720,186.7C960,192,1200,160,1320,144L1440,128L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
  ]
};

export function WaveAccentBlock({ block }: BlockProps) {
  const { props } = block;
  const isPreview = React.useContext(PreviewContext);

  const pattern = (props.pattern as keyof typeof WAVE_PATHS) || "smooth";
  const layers = (props.layers as number) ?? 3;
  const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
  const defaultPrimary = theme.colors?.primary || "#6366f1";

  const fillColorRaw = (props.fillColor as string) || defaultPrimary;
  const fillColor = resolveCssColor(fillColorRaw) || defaultPrimary;

  const secondaryColorRaw = (props.secondaryColor as string) || "";
  const secondaryColor = secondaryColorRaw ? resolveCssColor(secondaryColorRaw) : "";

  const width = (props.width as string) || "300px";
  const height = (props.height as string) || "200px";
  const position = (props.position as string) || "top-right";
  const animated = props.animated as boolean ?? true;
  const zIndex = Number(props.zIndex ?? 1);

  const flipHorizontal = props.flipHorizontal as boolean ?? false;
  const flipVertical = props.flipVertical as boolean ?? false;

  const gradientId = `wave-accent-grad-${block.id}`;
  const fillGradientEnd = resolveCssColor(props.fillGradientEnd as string || "");

  // Positioning logic
  let top: string | number = "auto";
  let bottom: string | number = "auto";
  let left: string | number = "auto";
  let right: string | number = "auto";
  let finalFlipV = flipVertical;
  let finalFlipH = flipHorizontal;

  switch (position) {
    case "top-left":
      top = 0; left = 0;
      finalFlipV = !flipVertical; // Default to flipped for top corners
      break;
    case "top-right":
      top = 0; right = 0;
      finalFlipV = !flipVertical;
      break;
    case "bottom-left":
      bottom = 0; left = 0;
      break;
    case "bottom-right":
      bottom = 0; right = 0;
      break;
  }

  const transform = [
    finalFlipH ? "scaleX(-1)" : "",
    finalFlipV ? "scaleY(-1)" : ""
  ].filter(Boolean).join(" ");

  const svgStyle: React.CSSProperties = {
    position: "absolute",
    top, bottom, left, right,
    width, height,
    transform: transform || "none",
    transition: "all 0.3s ease",
    zIndex: zIndex,
    pointerEvents: "none",
    overflow: "visible"
  };

  let allPaths = WAVE_PATHS[pattern] || WAVE_PATHS["smooth"];
  const maxLayers = Math.min(Math.max(layers, 1), allPaths.length);
  const paths = allPaths.slice(allPaths.length - maxLayers);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: zIndex }}>
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={svgStyle}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {fillGradientEnd && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={fillColor} />
              <stop offset="100%" stopColor={fillGradientEnd} />
            </linearGradient>
          )}
        </defs>
        {animated && (
          <style>
            {`
              @keyframes wave-accent-drift {
                0% { transform: translateX(0); }
                100% { transform: translateX(40px); }
              }
            `}
          </style>
        )}
        {paths.map((d, i) => {
          const isTopLayer = i === paths.length - 1;
          const opacity = isTopLayer ? 1 : Math.max(0.2, 0.3 + (i * 0.15));
          let currentFill = isTopLayer ? (fillGradientEnd ? `url(#${gradientId})` : fillColor) : (secondaryColor || fillColor);

          return (
            <path
              key={`${pattern}-${i}`}
              fill={currentFill}
              fillOpacity={opacity}
              d={d}
              style={{
                animation: animated && !isTopLayer ? `wave-accent-drift ${10 + i * 3}s linear infinite alternate` : "none",
                transformOrigin: "center"
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

function resolveCssColor(value: string): string {
  if (!value || !value.startsWith("var(")) return value;
  if (typeof window === "undefined" || !document?.documentElement) return value;
  try {
    const varName = value.replace(/^var\(/, "").replace(/\)$/, "").trim();
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || value;
  } catch { return value; }
}
