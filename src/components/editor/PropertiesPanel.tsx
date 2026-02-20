"use client";

import { useEditorStore, Block, EditorPage, MetaConfig, ThemeConfig } from "@/stores/editorStore";
import { Trash2, Settings2 } from "lucide-react";

export function PropertiesPanel() {
  const {
    page, selectedBlockId, selectBlock,
    updateBlock, updateBlockStyle, deleteBlock,
    updateMeta, updateTheme,
  } = useEditorStore();

  // Cast update functions for page settings usage
  const handleUpdateMeta = (m: Partial<MetaConfig>) => updateMeta(m);
  const handleUpdateTheme = (t: Partial<ThemeConfig>) => updateTheme(t);

  const selectedBlock = page?.content?.find(b => b.id === selectedBlockId) ?? null;

  return (
    <aside style={{
      position: "fixed",
      top: 52, right: 0, bottom: 0,
      width: 280,
      background: "var(--bg)",
      borderLeft: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      zIndex: 100,
      overflowY: "auto",
    }}>
      {selectedBlock ? (
        <BlockProperties
          block={selectedBlock}
          onUpdate={(props) => updateBlock(selectedBlock.id, props)}
          onUpdateStyle={(style) => updateBlockStyle(selectedBlock.id, style)}
          onDelete={() => { deleteBlock(selectedBlock.id); selectBlock(null); }}
        />
      ) : (
        <PageSettings
          page={page}
          onUpdateMeta={handleUpdateMeta}
          onUpdateTheme={handleUpdateTheme}
        />
      )}
    </aside>
  );
}

// ─── Block Properties ────────────────────────────────────────────────────────

function BlockProperties({
  block, onUpdate, onUpdateStyle, onDelete,
}: {
  block: Block;
  onUpdate: (props: Record<string, unknown>) => void;
  onUpdateStyle: (style: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader
        title={`${block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block`}
        subtitle="Edit block properties"
        action={
          <button
            onClick={onDelete}
            title="Delete block"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--danger)", padding: "0.25rem",
              display: "flex", alignItems: "center",
            }}
          >
            <Trash2 size={15} />
          </button>
        }
      />
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
        {block.type === "hero" && <HeroProps block={block} onUpdate={onUpdate} />}
        {block.type === "heading" && <HeadingProps block={block} onUpdate={onUpdate} />}
        {block.type === "text" && <TextProps block={block} onUpdate={onUpdate} />}
        {block.type === "image" && <ImageProps block={block} onUpdate={onUpdate} />}
        {block.type === "button" && <ButtonProps block={block} onUpdate={onUpdate} />}
        {block.type === "divider" && <DividerProps block={block} onUpdate={onUpdate} />}
        {block.type === "spacer" && <SpacerProps block={block} onUpdate={onUpdate} />}
        {block.type === "columns" && <ColumnsProps block={block} onUpdate={onUpdate} />}

        {/* Shared spacing */}
        <Section title="Spacing">
          <Field label="Padding">
            <input
              type="text"
              defaultValue={block.style?.padding ?? ""}
              onBlur={e => onUpdateStyle({ padding: e.target.value || undefined })}
              placeholder="e.g. 1rem 2rem"
              style={inputStyle}
            />
          </Field>
          <Field label="Margin">
            <input
              type="text"
              defaultValue={block.style?.margin ?? ""}
              onBlur={e => onUpdateStyle({ margin: e.target.value || undefined })}
              placeholder="e.g. 0 0 1rem"
              style={inputStyle}
            />
          </Field>
        </Section>
      </div>
    </div>
  );
}

// ─── Block-specific props forms ──────────────────────────────────────────────

function HeroProps({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const p = block.props;
  return (
    <>
      <Section title="Content">
        <Field label="Heading">
          <input type="text" defaultValue={String(p.heading ?? "")}
            onBlur={e => onUpdate({ heading: e.target.value })} style={inputStyle} />
        </Field>
        <Field label="Subheading">
          <textarea defaultValue={String(p.subheading ?? "")}
            onBlur={e => onUpdate({ subheading: e.target.value })}
            rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </Field>
        <Field label="CTA Text">
          <input type="text" defaultValue={String(p.ctaText ?? "")}
            onBlur={e => onUpdate({ ctaText: e.target.value })} style={inputStyle} />
        </Field>
        <Field label="CTA Link">
          <input type="text" defaultValue={String(p.ctaHref ?? "")}
            onBlur={e => onUpdate({ ctaHref: e.target.value })} style={inputStyle} placeholder="https://..." />
        </Field>
      </Section>
      <Section title="Style">
        <Field label="Text Alignment">
          <Select
            value={String(p.align ?? "center")}
            onChange={v => onUpdate({ align: v })}
            options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]}
          />
        </Field>
        <Field label="Text Color">
          <ColorInput value={String(p.textColor ?? "#ffffff")} onChange={v => onUpdate({ textColor: v })} />
        </Field>
        <Field label="CTA Color">
          <ColorInput value={String(p.ctaColor ?? "#6366f1")} onChange={v => onUpdate({ ctaColor: v })} />
        </Field>
      </Section>
    </>
  );
}

function HeadingProps({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const p = block.props;
  return (
    <Section title="Content">
      <Field label="Text">
        <input type="text" defaultValue={String(p.text ?? "")}
          onBlur={e => onUpdate({ text: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Level">
        <Select
          value={String(p.level ?? "h2")}
          onChange={v => onUpdate({ level: v })}
          options={[
            { value: "h1", label: "H1 — Largest" },
            { value: "h2", label: "H2 — Large" },
            { value: "h3", label: "H3 — Medium" },
            { value: "h4", label: "H4 — Small" },
          ]}
        />
      </Field>
      <Field label="Alignment">
        <Select
          value={String(p.align ?? "left")}
          onChange={v => onUpdate({ align: v })}
          options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]}
        />
      </Field>
      <Field label="Color">
        <ColorInput value={String(p.color ?? "#000000")} onChange={v => onUpdate({ color: v })} />
      </Field>
    </Section>
  );
}

function TextProps({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const p = block.props;
  return (
    <Section title="Content">
      <Field label="Text">
        <textarea defaultValue={String(p.text ?? "")}
          onBlur={e => onUpdate({ text: e.target.value })}
          rows={5} style={{ ...inputStyle, resize: "vertical" }} />
      </Field>
      <Field label="Size">
        <Select
          value={String(p.size ?? "md")}
          onChange={v => onUpdate({ size: v })}
          options={[{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]}
        />
      </Field>
      <Field label="Alignment">
        <Select
          value={String(p.align ?? "left")}
          onChange={v => onUpdate({ align: v })}
          options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]}
        />
      </Field>
      <Field label="Color">
        <ColorInput value={String(p.color ?? "#64748b")} onChange={v => onUpdate({ color: v })} />
      </Field>
    </Section>
  );
}

function ImageProps({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const p = block.props;
  return (
    <Section title="Image">
      <Field label="Image URL">
        <input type="text" defaultValue={String(p.src ?? "")}
          onBlur={e => onUpdate({ src: e.target.value })} style={inputStyle} placeholder="https://..." />
      </Field>
      <Field label="Alt Text">
        <input type="text" defaultValue={String(p.alt ?? "")}
          onBlur={e => onUpdate({ alt: e.target.value })} style={inputStyle} placeholder="Image description" />
      </Field>
      <Field label="Height (px)">
        <input type="number" defaultValue={Number(p.height ?? 300)}
          onBlur={e => onUpdate({ height: Number(e.target.value) })} style={inputStyle} min={50} max={800} />
      </Field>
      <Field label="Object Fit">
        <Select
          value={String(p.fit ?? "cover")}
          onChange={v => onUpdate({ fit: v })}
          options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "fill", label: "Fill" }]}
        />
      </Field>
      <Field label="Border Radius (px)">
        <input type="number" defaultValue={Number(p.borderRadius ?? 0)}
          onBlur={e => onUpdate({ borderRadius: Number(e.target.value) })} style={inputStyle} min={0} max={32} />
      </Field>
    </Section>
  );
}

function ButtonProps({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const p = block.props;
  return (
    <Section title="Button">
      <Field label="Label">
        <input type="text" defaultValue={String(p.label ?? "")}
          onBlur={e => onUpdate({ label: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Link">
        <input type="text" defaultValue={String(p.href ?? "")}
          onBlur={e => onUpdate({ href: e.target.value })} style={inputStyle} placeholder="https://..." />
      </Field>
      <Field label="Style">
        <Select
          value={String(p.variant ?? "primary")}
          onChange={v => onUpdate({ variant: v })}
          options={[
            { value: "primary", label: "Primary (filled)" },
            { value: "secondary", label: "Secondary (tinted)" },
            { value: "outline", label: "Outline" },
            { value: "ghost", label: "Ghost" },
          ]}
        />
      </Field>
      <Field label="Size">
        <Select
          value={String(p.size ?? "md")}
          onChange={v => onUpdate({ size: v })}
          options={[{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]}
        />
      </Field>
      <Field label="Alignment">
        <Select
          value={String(p.align ?? "center")}
          onChange={v => onUpdate({ align: v })}
          options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]}
        />
      </Field>
      <Field label="Color">
        <ColorInput value={String(p.color ?? "#6366f1")} onChange={v => onUpdate({ color: v })} />
      </Field>
    </Section>
  );
}

function DividerProps({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const p = block.props;
  return (
    <Section title="Divider">
      <Field label="Style">
        <Select
          value={String(p.style ?? "solid")}
          onChange={v => onUpdate({ style: v })}
          options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]}
        />
      </Field>
      <Field label="Color">
        <ColorInput value={String(p.color ?? "#e2e8f0")} onChange={v => onUpdate({ color: v })} />
      </Field>
      <Field label="Thickness (px)">
        <input type="number" defaultValue={Number(p.thickness ?? 1)}
          onBlur={e => onUpdate({ thickness: Number(e.target.value) })} style={inputStyle} min={1} max={8} />
      </Field>
      <Field label="Width (%)">
        <input type="number" defaultValue={Number(p.width ?? 100)}
          onBlur={e => onUpdate({ width: Number(e.target.value) })} style={inputStyle} min={10} max={100} />
      </Field>
    </Section>
  );
}

function SpacerProps({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const p = block.props;
  return (
    <Section title="Spacer">
      <Field label="Height (px)">
        <input type="number" defaultValue={Number(p.height ?? 48)}
          onBlur={e => onUpdate({ height: Number(e.target.value) })} style={inputStyle} min={8} max={400} />
      </Field>
    </Section>
  );
}

function ColumnsProps({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const p = block.props;
  return (
    <Section title="Columns">
      <Field label="Number of columns">
        <Select
          value={String(p.columns ?? 2)}
          onChange={v => onUpdate({ columns: Number(v) })}
          options={[{ value: "2", label: "2 columns" }, { value: "3", label: "3 columns" }, { value: "4", label: "4 columns" }]}
        />
      </Field>
      <Field label="Gap (px)">
        <input type="number" defaultValue={Number(p.gap ?? 24)}
          onBlur={e => onUpdate({ gap: Number(e.target.value) })} style={inputStyle} min={0} max={80} />
      </Field>
    </Section>
  );
}

// ─── Page Settings ───────────────────────────────────────────────────────────

function PageSettings({
  page,
  onUpdateMeta,
  onUpdateTheme,
}: {
  page: EditorPage | null;
  onUpdateMeta: (m: Partial<MetaConfig>) => void;
  onUpdateTheme: (t: Partial<ThemeConfig>) => void;
}) {
  if (!page) return (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
      Loading page…
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader title="Page Settings" subtitle="Click a block to edit it" />
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
        <Section title="SEO / Meta">
          <Field label="Page Title">
            <input type="text" defaultValue={page.meta.title ?? page.title}
              onBlur={e => onUpdateMeta({ title: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Description">
            <textarea defaultValue={page.meta.description ?? ""}
              onBlur={e => onUpdateMeta({ description: e.target.value })}
              rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Meta description…" />
          </Field>
          <Field label="Robots">
            <Select
              value={page.meta.robots ?? "index, follow"}
              onChange={v => onUpdateMeta({ robots: v })}
              options={[
                { value: "index, follow", label: "Index, Follow" },
                { value: "noindex, nofollow", label: "No Index, No Follow" },
                { value: "index, nofollow", label: "Index, No Follow" },
              ]}
            />
          </Field>
        </Section>

        <Section title="Theme Colors">
          <Field label="Primary Color">
            <ColorInput
              value={page.theme.colors.primary ?? "#6366f1"}
              onChange={v => onUpdateTheme({ colors: { ...page.theme.colors, primary: v } })}
            />
          </Field>
          <Field label="Background">
            <ColorInput
              value={page.theme.colors.background ?? "#ffffff"}
              onChange={v => onUpdateTheme({ colors: { ...page.theme.colors, background: v } })}
            />
          </Field>
          <Field label="Text Color">
            <ColorInput
              value={page.theme.colors.text ?? "#0f172a"}
              onChange={v => onUpdateTheme({ colors: { ...page.theme.colors, text: v } })}
            />
          </Field>
        </Section>
      </div>
    </div>
  );
}

// ─── Shared UI primitives ────────────────────────────────────────────────────

function PanelHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{
      padding: "0.875rem 0.875rem 0.625rem",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      gap: "0.5rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
        <Settings2 size={14} color="var(--text-muted)" />
        <div>
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{title}</p>
          {subtitle && <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-subtle)" }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <p style={{
        fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.06em",
        margin: "0 0 0.5rem",
        paddingBottom: "0.35rem",
        borderBottom: "1px solid var(--border)",
      }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: "pointer" }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 32, height: 28, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2, background: "var(--surface)" }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, flex: 1 }}
        placeholder="#000000"
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.45rem 0.625rem",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.8rem",
  outline: "none",
  boxSizing: "border-box",
};
