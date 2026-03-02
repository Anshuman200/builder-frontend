"use client";

import type { BlockConfig, SectionTemplate } from "@/@Types";
import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  MagnifyingGlassIcon, XMarkIcon, PlusIcon, FaceFrownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { getIcon } from "@/lib/icons";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { BLOCK_TYPES, createBlock } from "@/lib/blockConfig";
import { SECTION_TEMPLATES } from "@/lib/sectionTemplates";
import { useEditorStore } from "@/stores/editorStore";
import { EDITOR_FEATURES } from "@/lib/editorFeatures";

// ─── Category display order ───────────────────────────────────────────────────
const CATEGORY_ORDER = ["Navigation", "Hero", "Logos", "Team", "Gallery", "Features", "Pricing", "Testimonial", "Contact", "Footer"];

// Category icons (emoji for quick visual distinction)
const CATEGORY_ICONS: Record<string, string> = {
  Navigation: "🧭", Hero: "⭐", Logos: "🏷️", Team: "👥",
  Gallery: "🖼️", Features: "✨", Pricing: "💰",
  Testimonial: "💬", Contact: "📬", Footer: "📄",
};

export default function BlockPalette() {
  const [activeTab, setActiveTab] = React.useState<"elements" | "sections">("sections");
  const [drawerCategory, setDrawerCategory] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  // Group sections by category
  const sectionsByCategory = React.useMemo(() => {
    const groups: Record<string, SectionTemplate[]> = {};
    for (const t of SECTION_TEMPLATES) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return groups;
  }, []);

  const categories = React.useMemo(
    () => CATEGORY_ORDER.filter(c => sectionsByCategory[c] && EDITOR_FEATURES.allowedSectionCategories.includes(c)),
    [sectionsByCategory]
  );

  const filteredElements = React.useMemo(
    () => BLOCK_TYPES.filter(b =>
      EDITOR_FEATURES.allowedElements.includes(b.type) &&
      (!search || b.label.toLowerCase().includes(search.toLowerCase()))
    ),
    [search]
  );

  return (
    <div style={{ display: "flex", height: "100%", position: "relative" }}>
      {/* ── Main sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
        zIndex: 2,
      }}>
        {/* Tab bar */}
        <div style={{ display: "flex", padding: "8px 8px 0", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {(["elements", "sections"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setDrawerCategory(null); }}
              style={{
                flex: 1, padding: "10px 0",
                background: "transparent", border: "none",
                borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                color: activeTab === tab ? "var(--text)" : "var(--text-muted)",
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: 12, cursor: "pointer", transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {tab === "elements" ? "Elements" : "Sections"}
            </button>
          ))}
        </div>

        {/* Search (elements only) */}
        {activeTab === "elements" && (
          <div style={{ padding: "8px 10px", flexShrink: 0, borderBottom: "1px solid var(--border)" }}>
            <div style={{ position: "relative" }}>
              <MagnifyingGlassIcon className="absolute left-[9px] top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search elements…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 7, padding: "6px 8px 6px 28px",
                  fontSize: 12, color: "var(--text)", outline: "none",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                >
                  <XMarkIcon style={{ width: 11, height: 11 }} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: 4 }}>

          {/* ── ELEMENTS ── */}
          {activeTab === "elements" && filteredElements.map(config => (
            <PaletteCard key={config.type} config={config} />
          ))}
          {activeTab === "elements" && filteredElements.length === 0 && <EmptyState />}

          {/* ── SECTIONS: category list ── */}
          {activeTab === "sections" && categories.map(cat => (
            <button
              key={cat}
              onClick={() => setDrawerCategory(drawerCategory === cat ? null : cat)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, border: "none",
                background: drawerCategory === cat ? "var(--primary)" : "var(--surface)",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[cat] ?? "📦"}</span>
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 600,
                color: drawerCategory === cat ? "#fff" : "var(--text)",
              }}>
                {cat}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{
                  fontSize: 10, color: drawerCategory === cat ? "rgba(255,255,255,0.7)" : "var(--text-subtle)",
                  background: drawerCategory === cat ? "rgba(255,255,255,0.2)" : "var(--surface-hover)",
                  borderRadius: 10, padding: "1px 6px",
                }}>
                  {sectionsByCategory[cat]?.length ?? 0}
                </span>
                <ChevronRightIcon style={{
                  width: 12, height: 12,
                  color: drawerCategory === cat ? "#fff" : "var(--text-muted)",
                  transform: drawerCategory === cat ? "rotate(90deg)" : "none",
                  transition: "transform 0.2s",
                }} />
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{ padding: "7px 12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 10, color: "var(--text-subtle)", lineHeight: 1.5 }}>
            {activeTab === "elements" ? "Drag or click to add to canvas." : "Choose a category to browse sections."}
          </p>
        </div>
      </aside>

      {/* ── Sections Drawer ── */}
      {drawerCategory && (
        <div style={{
          width: 300, flexShrink: 0,
          display: "flex", flexDirection: "column",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          overflow: "hidden",
          zIndex: 1,
        }}>
          {/* Drawer header */}
          <div style={{
            display: "flex", alignItems: "center", padding: "12px 14px",
            borderBottom: "1px solid var(--border)", flexShrink: 0, gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[drawerCategory]}</span>
            <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
              {drawerCategory}
            </span>
            <button
              onClick={() => setDrawerCategory(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 2 }}
            >
              <XMarkIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Drawer section list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: 10 }}>
            {(sectionsByCategory[drawerCategory] ?? []).map(tpl => (
              <DrawerSectionCard key={tpl.id} template={tpl} onAdd={() => setDrawerCategory(null)} />
            ))}
          </div>

          <div style={{ padding: "7px 12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 10, color: "var(--text-subtle)", lineHeight: 1.5 }}>
              Click to insert section into canvas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drawer section card with scaled iframe preview ────────────────────────────
function DrawerSectionCard({ template, onAdd }: { template: SectionTemplate; onAdd: () => void }) {
  const { addBlock, selectBlock } = useEditorStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template:${template.id}`,
    data: { type: "section", templateId: template.id },
  });

  function handleClick() {
    const newBlock = template.create();
    addBlock(newBlock);
    selectBlock(newBlock.id);
    onAdd();
  }

  const SCALE = 0.245;
  const PREVIEW_W = 1200;
  const PREVIEW_H = 380;
  const thumbH = Math.round(PREVIEW_H * SCALE); // ~93px

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      style={{
        borderRadius: 10, border: "1px solid var(--border)",
        background: "var(--surface)", cursor: "pointer",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none", overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--primary)";
        el.style.boxShadow = "0 4px 16px rgba(99,102,241,0.18)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Scaled HTML preview */}
      <div style={{
        width: "100%", height: thumbH,
        overflow: "hidden", pointerEvents: "none",
        background: "#fff", position: "relative",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          pointerEvents: "none",
          color: "#000", /* Force black text for the white background */
          fontFamily: "system-ui, sans-serif",
        }} dangerouslySetInnerHTML={{ __html: template.preview }} />
      </div>

      {/* Label */}
      <div style={{
        padding: "7px 12px 9px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {template.name}
        </span>
        <PlusIcon style={{ width: 13, height: 13, color: "var(--primary)", flexShrink: 0 }} />
      </div>
    </div>
  );
}

// ─── Element palette card ─────────────────────────────────────────────────────
function PaletteCard({ config }: { config: BlockConfig }) {
  const { addBlock, selectBlock } = useEditorStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${config.type}`,
    data: { type: "palette", blockType: config.type },
  });
  const Icon = getIcon(config.icon) ?? Square2StackIcon;

  function handleClick() {
    const newBlock = createBlock(config.type);
    addBlock(newBlock);
    selectBlock(newBlock.id);
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 10px", borderRadius: 8,
        border: "1px solid var(--border)", background: "var(--surface)",
        cursor: "pointer", opacity: isDragging ? 0.4 : 1,
        userSelect: "none", transition: "background 0.12s, border-color 0.12s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
    >
      <div style={{ width: 30, height: 30, borderRadius: 6, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--primary)" }}>
        <Icon style={{ width: 14, height: 14 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{config.label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "32px 16px", color: "var(--text-subtle)" }}>
      <FaceFrownIcon style={{ width: 24, height: 24, strokeWidth: 1.5 }} />
      <span style={{ fontSize: 12 }}>Nothing found</span>
    </div>
  );
}