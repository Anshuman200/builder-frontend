"use client";

import React from "react";
import type { Block } from "@/types";
import { ChildBlockWrapper, DropZoneStrip, PreviewContext, type BlockProps, SortableBlockGroup, getBackgroundStyles, BackgroundOverlay } from "./shared";
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

export function WaveBlock({ block }: BlockProps) {
  const { props } = block;
  const isPreview = React.useContext(PreviewContext);

  // Extract props with new customization defaults
  const childBlocks = (props.childBlocks as Block[]) || [];
  const pattern = (props.pattern as keyof typeof WAVE_PATHS) || "smooth";
  const layers = (props.layers as number) ?? 3; // 1 to 3

  const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
  const defaultPrimary = theme.colors?.primary || "#6366f1";

  // Resolve colors — must be real hex/rgb for SVG fill to work in all contexts
  const fillColorRaw = (props.fillColor as string) || defaultPrimary;
  const fillColor = resolveCssColor(fillColorRaw) || defaultPrimary;

  const gradientEndRaw = (props.fillGradientEnd as string) || "";
  const fillGradientEnd = gradientEndRaw ? resolveCssColor(gradientEndRaw) : "";

  const secondaryColorRaw = (props.secondaryColor as string) || "";
  const secondaryColor = secondaryColorRaw ? resolveCssColor(secondaryColorRaw) : "";

  const bgStyles = getBackgroundStyles(props, theme);
  const minHeight = (props.height as string) || "450px";
  const waveHeight = (props.waveHeight as string) || "150px";
  const flipHorizontal = props.flipHorizontal as boolean ?? true;
  const flipVertical = props.flipVertical as boolean ?? true;
  const animated = props.animated as boolean ?? true;
  const waveOnTop = props.waveOnTop as boolean ?? true;

  // Unique IDs per block for SVG defs
  const gradientId = `wave-grad-${block.id}`;
  const useGradient = !!fillGradientEnd;

  // Select paths based on pattern and layers
  let allPaths = WAVE_PATHS[pattern] || WAVE_PATHS["smooth"];
  const maxLayers = Math.min(Math.max(layers, 1), allPaths.length > 1 ? 3 : 1);

  let paths: string[];
  if (allPaths.length >= maxLayers) {
    // Slice from the end so bottom-most layer is always included
    paths = allPaths.slice(allPaths.length - maxLayers);
  } else {
    // If pattern doesn't have enough paths, duplicate/scale
    paths = Array(maxLayers).fill(allPaths[0]);
  }

  // Base styling for the container
  const style: React.CSSProperties = {
    ...bgStyles,
    width: "100%",
    position: "relative",
    padding: (props.padding as string) || "0px",
    paddingTop: (props.paddingTop as string) || (props.padding as string) || "24px",
    paddingBottom: (props.paddingBottom as string) || (props.padding as string) || "24px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: minHeight,
  };

  // To flip the SVG visually
  const transform = [
    flipHorizontal ? "scaleX(-1)" : "",
    flipVertical ? "scaleY(-1)" : ""
  ].filter(Boolean).join(" ");

  const svgStyle: React.CSSProperties = {
    position: "absolute",
    left: animated ? "-100px" : 0,
    bottom: flipVertical ? "auto" : 0,
    top: flipVertical ? 0 : "auto",
    width: animated ? "calc(100% + 200px)" : "100%",
    height: waveHeight,
    transform: transform || "none",
    transition: "fill 0.3s ease, height 0.3s ease",
    animation: animated ? "wave-pulse 4s ease-in-out infinite alternate" : "none",
    zIndex: waveOnTop ? 3 : 1,
    pointerEvents: "none"
  };

  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const isSelected = selectedBlockId === block.id;

  return (
    <div style={style}>
      <BackgroundOverlay p={props} />
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={svgStyle}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {useGradient && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={fillColor} />
              <stop offset="100%" stopColor={fillGradientEnd} />
            </linearGradient>
          )}
        </defs>
        <style>
          {`
            @keyframes wave-pulse {
              0% { transform: scaleY(1) ${transform}; }
              100% { transform: scaleY(1.1) ${transform}; }
            }
            @keyframes wave-drift {
              0% { transform: translateX(0); }
              100% { transform: translateX(80px); }
            }
          `}
        </style>
        {paths.map((d, i) => {
          // Bottom-most layer = index 0, top-most = last index
          const isTopLayer = i === paths.length - 1;
          // Layers behind gradually fade
          const opacity = isTopLayer ? 1 : Math.max(0.25, 0.4 + (i * 0.15));
          let currentFill = isTopLayer ? (useGradient ? `url(#${gradientId})` : fillColor) : (secondaryColor || fillColor);

          return (
            <path
              key={`${pattern}-${i}`}
              fill={currentFill}
              fillOpacity={opacity}
              d={d}
              style={{
                animation: animated && !isTopLayer ? `wave-drift ${8 + i * 2}s linear infinite alternate` : "none",
                transformOrigin: "bottom"
              }}
            />
          );
        })}
      </svg>

      <div style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: (props.contentAlignY as string) || "center",
        alignItems: (props.contentAlignX as string) || "center",
        flex: 1,
        gap: (props.contentGap as string) || "1rem"
      }}>
        <SortableBlockGroup blocks={childBlocks}>
          {childBlocks.map((child: Block) => (
            <ChildBlockWrapper key={child.id} block={child} />
          ))}
        </SortableBlockGroup>
        {!isPreview && (isSelected || childBlocks.length === 0) && (
          <DropZoneStrip zoneId={`wave-${block.id}`} hasChildren={childBlocks.length > 0} emptyLabel="Drag blocks inside the wave layer" />
        )}
      </div>
    </div>
  );
}

/**
 * Resolve a CSS variable string to a real hex/rgb value by reading it from
 * the document. Falls back to the raw value if it's not a CSS variable.
 * This is needed because SVG fill="" does not support CSS custom properties.
 */
function resolveCssColor(value: string): string {
  if (!value) return value;
  if (!value.startsWith("var(")) return value;
  // If we're in SSR or jsdom, bail out gracefully
  if (typeof window === "undefined" || !document?.documentElement) return value;
  try {
    const varName = value.replace(/^var\(/, "").replace(/\)$/, "").trim();
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return resolved || value;
  } catch {
    return value;
  }
}


