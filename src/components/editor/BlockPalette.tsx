"use client";

import type { BlockConfig, SectionTemplate } from "@/@Types";
import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  MagnifyingGlassIcon, XMarkIcon, PlusIcon, FaceFrownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { getIcon } from "@/lib/utils/icons";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { BLOCK_TYPES, createBlock, injectProjectName } from "@/lib/config/blocks";
import { SECTION_TEMPLATES } from "@/lib/config/sections";
import { useEditorStore } from "@/stores/editorStore";
import { Popover } from "antd";

// ─── Category display order ───────────────────────────────────────────────────
const CATEGORY_ORDER = ["Navigation", "Hero", "Logos", "Team", "Gallery", "Features", "Stats", "Pricing", "Testimonial", "FAQ", "Contact", "CTA", "Footer"];

const CATEGORY_ICONS: Record<string, string> = {
  Navigation: "🧭", Hero: "⭐", Logos: "🏷️", Team: "👥",
  Gallery: "🖼️", Features: "✨", Stats: "📊", Pricing: "💰",
  Testimonial: "💬", Contact: "📬", Footer: "📄", FAQ: "❓", CTA: "⚡",
};

// Auto-derive which block types are already covered by a section template.
const SECTION_COVERED_TYPES = new Set<string>(
  SECTION_TEMPLATES.flatMap(t => {
    try { return [t.create().type]; } catch { return []; }
  })
);

// ─── Sections popover panel ───────────────────────────────────────────────────
function SectionsPanel({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = React.useState("");
  const [drawerCategory, setDrawerCategory] = React.useState<string | null>(null);
  const [lastDrawerCategory, setLastDrawerCategory] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (drawerCategory) setLastDrawerCategory(drawerCategory);
  }, [drawerCategory]);

  const displayCategory = drawerCategory || lastDrawerCategory;

  const sectionsByCategory = React.useMemo(() => {
    const groups: Record<string, SectionTemplate[]> = {};
    for (const t of SECTION_TEMPLATES) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return groups;
  }, []);

  const categories = React.useMemo(
    () => CATEGORY_ORDER.filter(c => sectionsByCategory[c]),
    [sectionsByCategory]
  );

  const filteredCategories = React.useMemo(
    () => search ? categories.filter(c => c.toLowerCase().includes(search.toLowerCase())) : categories,
    [categories, search]
  );

  return (
    <div style={{ display: "flex", height: 480, width: 480, background: "var(--bg-secondary)", borderRadius: 14, overflow: "hidden" }}>
      {/* Category list */}
      <div style={{
        width: 190, flexShrink: 0, display: "flex", flexDirection: "column",
        borderRight: "1px solid var(--border)", background: "var(--bg-secondary)",
      }}>
        <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ position: "relative" }}>
            <MagnifyingGlassIcon className="absolute left-[9px] top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 7, padding: "5px 8px 5px 27px",
                fontSize: 12, color: "var(--text)", outline: "none",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                <XMarkIcon style={{ width: 11, height: 11 }} />
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {filteredCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setDrawerCategory(drawerCategory === cat ? null : cat)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 10px", borderRadius: 8, border: "none",
                background: drawerCategory === cat ? "var(--primary)" : "transparent",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => { if (drawerCategory !== cat) (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}
              onMouseLeave={e => { if (drawerCategory !== cat) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[cat] ?? "📦"}</span>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: drawerCategory === cat ? "#fff" : "var(--text)" }}>{cat}</span>
              <span style={{
                fontSize: 10, borderRadius: 10, padding: "1px 5px",
                color: drawerCategory === cat ? "rgba(255,255,255,0.7)" : "var(--text-subtle)",
                background: drawerCategory === cat ? "rgba(255,255,255,0.2)" : "var(--surface-hover)",
              }}>{sectionsByCategory[cat]?.length ?? 0}</span>
            </button>
          ))}
          {filteredCategories.length === 0 && (
            <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--text-subtle)", fontSize: 12 }}>No categories found</div>
          )}
        </div>
      </div>

      {/* Section templates pane */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {displayCategory ? (
          <>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[displayCategory]}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", flex: 1 }}>{displayCategory}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {(sectionsByCategory[displayCategory] ?? []).map(tpl => (
                <DrawerSectionCard key={tpl.id} template={tpl} onAdd={onClose} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-subtle)" }}>
            <ChevronRightIcon style={{ width: 24, height: 24 }} />
            <span style={{ fontSize: 13 }}>Select a category</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Elements popover panel ───────────────────────────────────────────────────
function ElementsPanel({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = React.useState("");

  const filteredElements = React.useMemo(
    () => BLOCK_TYPES.filter(b =>
      !SECTION_COVERED_TYPES.has(b.type) &&
      (!search || b.label.toLowerCase().includes(search.toLowerCase()))
    ),
    [search]
  );

  return (
    <div style={{ width: 280, background: "var(--bg-secondary)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ position: "relative" }}>
          <MagnifyingGlassIcon className="absolute left-[9px] top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search elements…"
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 7, padding: "5px 8px 5px 27px",
              fontSize: 12, color: "var(--text)", outline: "none",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <XMarkIcon style={{ width: 11, height: 11 }} />
            </button>
          )}
        </div>
      </div>
      <div style={{ maxHeight: 460, overflowY: "auto", padding: "6px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
        {filteredElements.map(config => (
          <PaletteCard key={config.type} config={config} onAdd={onClose} />
        ))}
        {filteredElements.length === 0 && <EmptyState />}
      </div>
    </div>
  );
}

// ─── Main export — two pill buttons that open popovers ────────────────────────
export default function BlockPalette() {
  const [openPopover, setOpenPopover] = React.useState<"sections" | "elements" | null>(null);
  const activeDrag = useEditorStore(s => s.activeDrag);

  // Auto-close popover if any drag interaction starts
  React.useEffect(() => {
    if (activeDrag) setOpenPopover(null);
  }, [activeDrag]);

  return (
    <>
      <Popover
        open={openPopover === "sections"}
        onOpenChange={(open) => setOpenPopover(open ? "sections" : null)}
        trigger={"hover"}
        placement="bottomLeft"
        arrow={false}
        overlayInnerStyle={{ padding: 0, borderRadius: 14, overflow: "hidden", background: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}
        content={<SectionsPanel onClose={() => setOpenPopover(null)} />}
      >
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8, border: "none",
            background: openPopover === "sections" ? "var(--primary)" : "var(--surface)",
            color: openPopover === "sections" ? "#fff" : "var(--text)",
            cursor: "pointer", fontSize: 12, fontWeight: 600,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          <span style={{ fontSize: 13 }}>🧩</span>
          Sections
        </button>
      </Popover>

      <Popover
        open={openPopover === "elements"}
        onOpenChange={(open) => setOpenPopover(open ? "elements" : null)}
        trigger="hover"
        placement="bottomLeft"
        arrow={false}
        overlayInnerStyle={{ padding: 0, borderRadius: 14, overflow: "hidden", background: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}
        content={<ElementsPanel onClose={() => setOpenPopover(null)} />}
      >
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8, border: "none",
            background: openPopover === "elements" ? "var(--primary)" : "var(--surface)",
            color: openPopover === "elements" ? "#fff" : "var(--text)",
            cursor: "pointer", fontSize: 12, fontWeight: 600,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          <span style={{ fontSize: 13 }}>⚡</span>
          Elements
        </button>
      </Popover>
    </>
  );
}

// ─── Drawer section card ──────────────────────────────────────────────────────
function DrawerSectionCard({ template, onAdd }: { template: SectionTemplate; onAdd: () => void }) {
  const { addBlock, selectBlock, page } = useEditorStore();
  const projectName = page?.title || "PageCraft";
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template:${template.id}`,
    data: { type: "section", templateId: template.id },
  });

  function handleClick() {
    const rawBlock = template.create();
    const newBlock = injectProjectName(rawBlock, projectName);
    addBlock(newBlock);
    selectBlock(newBlock.id);
    onAdd();
  }

  const PREVIEW_H = 380;
  const SCALE = 0.245;
  const thumbH = Math.round(PREVIEW_H * SCALE);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      style={{
        borderRadius: 10, border: "1px solid var(--border)",
        background: "var(--surface-hover)", cursor: "pointer",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none", overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--primary)"; el.style.boxShadow = "0 4px 16px rgba(99,102,241,0.18)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = "none"; }}
    >
      <div style={{ width: "100%", height: thumbH, overflow: "hidden", pointerEvents: "none", background: "#fff", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: "100%", height: "100%", pointerEvents: "none", color: "#000", fontFamily: "system-ui, sans-serif" }} dangerouslySetInnerHTML={{ __html: template.preview }} />
      </div>
      <div style={{ padding: "7px 12px 9px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{template.name}</span>
        <PlusIcon style={{ width: 13, height: 13, color: "var(--primary)", flexShrink: 0 }} />
      </div>
    </div>
  );
}

// ─── Element palette card ─────────────────────────────────────────────────────
function PaletteCard({ config, onAdd }: { config: BlockConfig; onAdd: () => void }) {
  const { addBlock, selectBlock, page } = useEditorStore();
  const projectName = page?.title || "PageCraft";
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${config.type}`,
    data: { type: "palette", blockType: config.type },
  });
  const Icon = getIcon(config.icon) ?? Square2StackIcon;

  function handleClick() {
    const rawBlock = createBlock(config.type);
    const newBlock = injectProjectName(rawBlock, projectName);
    addBlock(newBlock);
    selectBlock(newBlock.id);
    onAdd();
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