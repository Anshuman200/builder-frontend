"use client";
import React from "react";
import { Section, Field, ColorInput, GradientInput, UnifiedBackgroundInput, MediaInput, SelectInput, SliderInput, VideoPlaybackOptions, ToggleInput, TextInputWithUnit, ToggleSwitch, WaveDecorationFields } from "./shared";
import { Block } from "@/types";
import { useEditorStore } from "@/stores/editorStore";

interface BackgroundPanelProps {
  block: Block;
}

export function BackgroundPanel({ block }: BackgroundPanelProps) {
  const { updateBlock } = useEditorStore();
  const p = block.props;

  const up = (key: string, val: unknown, commit?: boolean) =>
    updateBlock(block.id, { [key]: val }, commit);

  const bgImage = (p.bgImage as string) || "";
  const isVideo = bgImage ? (
    /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(bgImage) ||
    bgImage.toLowerCase().includes("video")
  ) : false;

  return (
    <>
      <Section title="Background">
        <Field label="Fill">
          <UnifiedBackgroundInput
            bgColor={(p.bgColor as string) || (p.sectionBg as string) || "transparent"}
            bgGradient={(p.bgGradient as string) || ""}
            onChangeColor={(v) => up("bgColor", v, true)}
            onChangeGradient={(v) => up("bgGradient", v, true)}
          />
        </Field>

        {(!!p.bgColor || !!p.bgGradient) && (
          <Field label="Fill Opacity">
            <SliderInput
              value={Number(p.bgFillOpacity ?? 50)}
              onChange={(v) => up("bgFillOpacity", v, true)}
            />
          </Field>
        )}

        <Field label="Media (Image or Video)">
          <MediaInput
            value={(p.bgImage as string) || ""}
            onChange={(v) => up("bgImage", v, true)}
            placeholder="https://solario.ai/cdn/videos/"
          />
        </Field>

        {!!p.bgImage && (
          <>
            {isVideo && (
              <VideoPlaybackOptions
                autoPlay={!!p.bgAutoPlay} onChangeAutoPlay={(v) => up("bgAutoPlay", v, true)}
                loop={!!p.bgLoop} onChangeLoop={(v) => up("bgLoop", v, true)}
                muted={p.bgMuted !== false} onChangeMuted={(v) => up("bgMuted", v, true)}
                title="Background Video Options"
              />
            )}
            <div className="mt-4">
              <Field label="Media Opacity">
                <SliderInput
                  value={Number(p.bgImageOpacity ?? 40)}
                  onChange={(v) => up("bgImageOpacity", v, true)}
                />
              </Field>
            </div>

            <Field label="Overlay Color">
              <ColorInput
                value={(p.bgOverlayColor as string) || "#000000"}
                onChange={(v) => up("bgOverlayColor", v, true)}
              />
            </Field>

            <Field label="Media Size">
              <SelectInput
                value={(p.bgSize as string) || "cover"}
                onChange={(v) => up("bgSize", v, true)}
                options={[
                  { label: "Cover", value: "cover" },
                  { label: "Contain", value: "contain" },
                  { label: "Auto", value: "auto" },
                  { label: "Custom", value: "custom" },
                ]}
              />
            </Field>

            <Field label="Media Position">
              <SelectInput
                value={(p.bgPosition as string) || "center"}
                onChange={(v) => up("bgPosition", v, true)}
                options={[
                  { label: "Center", value: "center" },
                  { label: "Top", value: "top" },
                  { label: "Bottom", value: "bottom" },
                  { label: "Left", value: "left" },
                  { label: "Right", value: "right" },
                ]}
              />
            </Field>

            {!isVideo && (
              <Field label="Media Repeat (Image only)">
                <SelectInput
                  value={(p.bgRepeat as string) || "no-repeat"}
                  onChange={(v) => up("bgRepeat", v, true)}
                  options={[
                    { label: "No Repeat", value: "no-repeat" },
                    { label: "Repeat", value: "repeat" },
                    { label: "Repeat X", value: "repeat-x" },
                    { label: "Repeat Y", value: "repeat-y" },
                  ]}
                />
              </Field>
            )}
          </>
        )}
      </Section>

      <Section title="Wave Decoration">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: !!p.showWave ? "12px" : "0" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)" }}>Enable Wave</span>
          <ToggleSwitch value={!!p.showWave} onChange={(v) => up("showWave", v, true)} />
        </div>

        {!!p.showWave && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
            <WaveDecorationFields p={p} up={up} />
          </div>
        )}
      </Section>
    </>
  );
}
