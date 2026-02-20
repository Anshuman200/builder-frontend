"use client";

import { useEditorStore } from "@/stores/editorStore";
import { PropertySection } from "../shared/PropertySection";
import { ControlRow } from "../shared/ControlRow";
import { StyleControls } from "../shared/StyleControls";
import { AnimationControls } from "../shared/AnimationControls";

interface ImagePropertiesProps {
    blockId: string;
}

export function ImageProperties({ blockId }: ImagePropertiesProps) {
    const { page, updateBlock } = useEditorStore();
    const block = page?.content.find((b) => b.id === blockId);
    if (!block) return null;
    const p = block.props as Record<string, unknown>;

    function set(key: string, value: unknown) {
        updateBlock(blockId, { [key]: value });
    }

    return (
        <>
            <PropertySection title="Image">
                <ControlRow label="URL">
                    <input
                        type="text"
                        value={(p.src as string) ?? ""}
                        onChange={(e) => set("src", e.target.value)}
                        className="prop-input"
                        placeholder="https://..."
                    />
                </ControlRow>
                {!!p.src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={p.src as string}
                        alt=""
                        className="w-full h-24 object-cover rounded-md border border-white/10"
                    />
                )}
                <ControlRow label="Alt Text">
                    <input
                        type="text"
                        value={(p.alt as string) ?? ""}
                        onChange={(e) => set("alt", e.target.value)}
                        className="prop-input"
                        placeholder="Describe the image"
                    />
                </ControlRow>
                <ControlRow label="Caption">
                    <input
                        type="text"
                        value={(p.caption as string) ?? ""}
                        onChange={(e) => set("caption", e.target.value)}
                        className="prop-input"
                        placeholder="Optional caption"
                    />
                </ControlRow>
            </PropertySection>

            <PropertySection title="Dimensions">
                <ControlRow label="Width">
                    <input
                        type="text"
                        value={(p.width as string) ?? "100%"}
                        onChange={(e) => set("width", e.target.value)}
                        className="prop-input"
                        placeholder="100%"
                    />
                </ControlRow>
                <ControlRow label="Height">
                    <input
                        type="text"
                        value={(p.height as string) ?? "300px"}
                        onChange={(e) => set("height", e.target.value)}
                        className="prop-input"
                        placeholder="300px"
                    />
                </ControlRow>
                <ControlRow label="Fit">
                    <select
                        value={(p.objectFit as string) ?? "cover"}
                        onChange={(e) => set("objectFit", e.target.value)}
                        className="prop-select"
                    >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                        <option value="none">None</option>
                    </select>
                </ControlRow>
                <ControlRow label="Radius">
                    <input
                        type="text"
                        value={(p.borderRadius as string) ?? "0px"}
                        onChange={(e) => set("borderRadius", e.target.value)}
                        className="prop-input"
                        placeholder="0px"
                    />
                </ControlRow>
            </PropertySection>

            <StyleControls blockId={blockId} />
            <AnimationControls blockId={blockId} />
        </>
    );
}
