"use client";
import React from "react";
import { Section, Field, ColorInput, GradientInput, UnifiedBackgroundInput, MediaInput, SelectInput, SliderInput } from "./shared";
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

  return (
    <Section title="Background">
      <Field label="Fill">
        <UnifiedBackgroundInput 
          bgColor={(p.bgColor as string) || (p.sectionBg as string) || "transparent"}
          bgGradient={(p.bgGradient as string) || ""}
          onChangeColor={(v) => up("bgColor", v, true)}
          onChangeGradient={(v) => up("bgGradient", v, true)}
        />
      </Field>

      <Field label="Background Image">
        <MediaInput 
          value={(p.bgImage as string) || ""} 
          onChange={(v) => up("bgImage", v, true)} 
          placeholder="https://images.unsplash.com/..."
        />
      </Field>

      {!!p.bgImage && (
        <>
          <Field label="Image Size">
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
          
          <Field label="Image Position">
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

          <Field label="Image Repeat">
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

          <Section title="Image Overlay">
            <Field label="Overlay Color">
              <ColorInput 
                value={(p.bgOverlayColor as string) || "rgba(0,0,0,0.5)"} 
                onChange={(v) => up("bgOverlayColor", v)} 
                onBlur={(v) => up("bgOverlayColor", v, true)} 
              />
            </Field>
            <Field label="Overlay Opacity">
              <SliderInput 
                value={Number(p.bgOverlayOpacity ?? (p.bgImage ? 50 : 0))} 
                onChange={(v) => up("bgOverlayOpacity", v, true)}
                min={0}
                max={100}
                step={1}
                unit="%"
              />
            </Field>
          </Section>
        </>
      )}
    </Section>
  );
}
