"use client";

import React from "react";
import type { Block } from "@/types";
import { ChildBlockWrapper, DropZoneStrip, PreviewContext, type BlockProps, SortableBlockGroup } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { DEFAULT_THEME } from "@/lib/utils/theme";

const WAVE_PATHS = {
  smooth: [
    "M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,165.3C672,160,768,96,864,80C960,64,1056,96,1152,101.3C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    "M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,218.7C672,224,768,192,864,181.3C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,176C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
  ],
  layered: [
    "M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,133.3C672,128,768,160,864,181.3C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    "M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,112C672,107,768,149,864,170.7C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,165.3C960,160,1056,96,1152,74.7C1248,53,1344,75,1392,85.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
  ],
  sharp: [
    "M0,192L60,170.7C120,149,240,107,360,112C480,117,600,171,720,186.7C840,203,960,181,1080,160C1200,139,1320,117,1380,106.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z",
    "M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,229.3C840,235,960,213,1080,192C1200,171,1320,149,1380,138.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z",
  ],
  curve: [
    "M0,256L1440,64L1440,320L0,320Z",
    "M0,288L1440,128L1440,320L0,320Z",
  ],
  swoosh: [
    "M0,256L80,229.3C160,203,320,149,480,154.7C640,160,800,224,960,250.7C1120,277,1280,267,1360,261.3L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z",
    "M0,160L80,165.3C160,171,320,181,480,154.7C640,128,800,64,960,69.3C1120,75,1280,149,1360,186.7L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z",
    "M0,96L80,106.7C160,117,320,139,480,117.3C640,96,800,32,960,21.3C1120,11,1280,53,1360,74.7L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
  ],
  water: [
    "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    "M0,128L48,122.7C96,117,192,107,288,112C384,117,480,139,576,160C672,181,768,203,864,181.3C960,160,1056,96,1152,74.7C1248,53,1344,75,1392,85.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
  ],
  blob: [
    "M0,64L80,85.3C160,107,320,149,480,186.7C640,224,800,256,960,245.3C1120,235,1280,181,1360,154.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z",
    "M0,128L80,138.7C160,149,320,171,480,186.7C640,203,800,213,960,208C1120,203,1280,181,1360,170.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z",
  ],
  valley: [
    "M0,320L120,282.7C240,245,480,171,720,170.7C960,171,1200,245,1320,282.7L1440,320L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z",
    "M0,224L120,224C240,224,480,224,720,186.7C960,149,1200,75,1320,37.3L1440,0L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
  ],
  deep: [
    "M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,202.7C672,235,768,277,864,282.7C960,288,1056,256,1152,240C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    "M0,128L48,138.7C96,149,192,171,288,208C384,245,480,299,576,304C672,309,768,267,864,240C960,213,1056,203,1152,213.3C1248,224,1344,256,1392,272L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    "M0,64L48,80C96,96,192,128,288,170.7C384,213,480,267,576,277.3C672,288,768,256,864,229.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
  ]
};

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

export function WaveBlock({ block }: BlockProps) {
  const { props } = block;
  const isPreview = React.useContext(PreviewContext);

  // Extract props with new customization defaults
  const childBlocks = (props.childBlocks as Block[]) || [];
  const pattern = (props.pattern as keyof typeof WAVE_PATHS) || "smooth";
  const layers = (props.layers as number) ?? 1; // 1 to 3

  const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
  const defaultPrimary = theme.colors?.primary || "#6366f1";

  // Resolve colors — must be real hex/rgb for SVG fill to work in all contexts
  const fillColorRaw = (props.fillColor as string) || defaultPrimary;
  const fillColor = resolveCssColor(fillColorRaw) || defaultPrimary;

  const gradientEndRaw = (props.fillGradientEnd as string) || "";
  const fillGradientEnd = gradientEndRaw ? resolveCssColor(gradientEndRaw) : "";

  const secondaryColorRaw = (props.secondaryColor as string) || "";
  const secondaryColor = secondaryColorRaw ? resolveCssColor(secondaryColorRaw) : "";

  const bgColor = (props.bgColor as string) || "transparent";
  const height = (props.height as string) || "150px";
  const flipHorizontal = props.flipHorizontal as boolean ?? false;
  const flipVertical = props.flipVertical as boolean ?? false;
  const animated = props.animated as boolean ?? false;
  const waveOnTop = props.waveOnTop as boolean ?? false;

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
    backgroundColor: bgColor,
    width: "100%",
    position: "relative",
    padding: (props.padding as string) || "0px",
    paddingTop: (props.paddingTop as string) || (props.padding as string) || "24px",
    paddingBottom: (props.paddingBottom as string) || (props.padding as string) || "24px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: height,
  };

  // To flip the SVG visually
  const transform = [
    flipHorizontal ? "scaleX(-1)" : "",
    flipVertical ? "scaleY(-1)" : ""
  ].filter(Boolean).join(" ");

  const svgStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    bottom: flipVertical ? "auto" : 0,
    top: flipVertical ? 0 : "auto",
    width: "100%",
    height: height,
    transform: transform || "none",
    transition: "fill 0.3s ease, height 0.3s ease",
    animation: animated ? "wave-pulse 4s ease-in-out infinite alternate" : "none",
    zIndex: waveOnTop ? 2 : 0,
    pointerEvents: "none"
  };

    const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
    const isSelected = selectedBlockId === block.id;

    return (
        <div style={style}>
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
              100% { transform: translateX(-50px); }
            }
          `}
                </style>
                {paths.map((d, i) => {
                    // Bottom-most layer = index 0, top-most = last index
                    const isTopLayer = i === paths.length - 1;
                    // Layers behind gradually fade
                    const opacity = isTopLayer ? 1 : Math.max(0.25, 0.4 + (i * 0.15));

                    // Color: top layer gets fill/gradient, back layers get secondary or a tinted version of primary
                    let currentFill: string;
                    if (isTopLayer) {
                        currentFill = useGradient ? `url(#${gradientId})` : fillColor;
                    } else {
                        currentFill = secondaryColor || fillColor;
                    }

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

            {/* Content Layer (Above the SVG contextually) */}
            <div style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                display: "flex",
                flexDirection: "column",
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
