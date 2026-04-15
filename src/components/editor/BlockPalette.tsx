"use client";

import type { BlockConfig, SectionTemplate } from "@/types";
import * as React from "react";
import { createPortal } from "react-dom";
import { useDraggable } from "@dnd-kit/core";
import {
  MagnifyingGlassIcon, XMarkIcon, PlusIcon, FaceFrownIcon,
  ChevronRightIcon, ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { getIcon } from "@/lib/utils/icons";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { BLOCK_TYPES, createBlock, injectProjectName } from "@/lib/config/blocks";
import { SECTION_TEMPLATES } from "@/lib/config/sections";
import { useEditorStore } from "@/stores/editorStore";
import { Popover } from "antd";

// ─── Category display order ───────────────────────────────────────────────────
const CATEGORY_ORDER = ["Navigation", "Hero", "Carousel", "Logos", "Team", "Gallery", "Features", "Stats", "Legal", "Pricing", "Testimonial", "FAQ", "Contact", "CTA", "Footer"];

const CATEGORY_ICONS: Record<string, string> = {
  Navigation: "🧭", Hero: "⭐", Carousel: "🎠", Logos: "🏷️", Team: "👥",
  Gallery: "🖼️", Features: "✨", Stats: "📊", Legal: "⚖️", Pricing: "💰",
  Testimonial: "💬", Contact: "📬", Footer: "📄", FAQ: "❓", CTA: "⚡",
};

/**
 * Categories where having MORE THAN ONE on a page is very unusual.
 * Adding a second one will show a confirmation dialog.
 *
 * Intentionally NOT singleton: Features, Team, Testimonial, Gallery,
 * Carousel, Logos, Legal, CTA — users may legitimately stack these.
 */
const SINGLETON_CATEGORIES = new Set([
  "Contact",    // one contact form per page
  "Pricing",    // one pricing table per page
  "Hero",       // one hero banner per page
  "Navigation", // one nav per page (also handled as globalBlock)
  "Footer",     // one footer per page (also handled as globalBlock)
  "FAQ",        // one FAQ section per page
  "Stats",      // one stats / numbers section per page
]);

/**
 * Element block types that should be used at most once per page.
 * These live in the Elements panel (not Sections).
 */
const SINGLETON_ELEMENT_TYPES = new Set([
  "accordion",     // FAQ / accordion — one per page is enough
  "contactForm",   // Contact form — one per page
  "deleteAccount", // Delete account block — one per page
]);

// Auto-derive which block types are already covered by a section template.
const SECTION_COVERED_TYPES = new Set<string>(
  SECTION_TEMPLATES.flatMap(t => {
    try { return [t.create().type]; } catch { return []; }
  })
);

// ─── Scroll to newly added block ──────────────────────────────────────────────
function scrollToBlock(blockId: string) {
  setTimeout(() => {
    const el =
      document.getElementById(`block-${blockId}`) ||
      document.getElementById(blockId) ||
      document.querySelector(`[data-block-id="${blockId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 200);
}

// ─── Custom dark-themed confirmation dialog ───────────────────────────────────
function DarkConfirmModal({
  title,
  description,
  confirmLabel = "Yes, Add Another",
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 420, maxWidth: "90vw",
          background: "linear-gradient(145deg, #0d0d18 0%, #111124 100%)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 18,
          padding: "24px 24px 20px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 40px rgba(245,158,11,0.06)",
          animation: "darkModalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`
          @keyframes darkModalIn {
            from { opacity: 0; transform: scale(0.92) translateY(8px); }
            to   { opacity: 1; transform: scale(1)   translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, flexShrink: 0, borderRadius: 12,
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(245,158,11,0.15)",
          }}>
            <ExclamationTriangleIcon style={{ width: 20, height: 20, color: "#f59e0b" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3 }}>
              {title}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#64748b", lineHeight: 1.6 }}>
              {description}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              height: 36, padding: "0 18px", borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#cbd5e1"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              height: 36, padding: "0 20px", borderRadius: 10,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              border: "none",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(245,158,11,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(245,158,11,0.35)"; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Check if the current route already has a section of a given category ─────
function findExistingInCategory(
  content: any[],
  category: string
): boolean {
  // Build a set of types belonging to this category
  const typesInCategory = new Set(
    SECTION_TEMPLATES
      .filter(t => t.category === category)
      .flatMap(t => { try { return [t.create().type]; } catch { return []; } })
  );
  return content.some(b => typesInCategory.has(b.type));
}

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
      !b.hidden &&
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
        styles={{ content: { padding: 0, borderRadius: 14, overflow: "hidden", background: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" } }}
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
        styles={{ content: { padding: 0, borderRadius: 14, overflow: "hidden", background: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" } }}
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
  const { addBlock, selectBlock, page, activeRouteId } = useEditorStore();
  const projectName = page?.title || "PageCraft";
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template:${template.id}`,
    data: { type: "section", templateId: template.id },
  });

  function doAdd() {
    const rawBlock = template.create();
    const newBlock = injectProjectName(rawBlock, projectName);
    addBlock(newBlock);
    selectBlock(newBlock.id);
    onAdd();
    scrollToBlock(newBlock.id);
  }

  function handleClick() {
    // ── Duplicate guard ───────────────────────────────────────────────────
    if (SINGLETON_CATEGORIES.has(template.category)) {
      const activeRoute = page?.routes?.find(r => r.id === activeRouteId);
      const content = activeRoute?.content ?? page?.content ?? [];
      if (findExistingInCategory(content, template.category)) {
        setShowConfirm(true);
        return;
      }
    }
    doAdd();
  }

  const PREVIEW_H = 380;
  const SCALE = 0.245;
  const thumbH = Math.round(PREVIEW_H * SCALE);

  return (<>
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

    {showConfirm && (
      <DarkConfirmModal
        title={`Already have a ${template.category} section`}
        description={`This page already has a ${template.category} section ("${template.name}"). Adding another one is unusual — are you sure?`}
        confirmLabel="Yes, Add Another"
        onConfirm={() => { setShowConfirm(false); doAdd(); }}
        onCancel={() => setShowConfirm(false)}
      />
    )}
  </>);
}

// ─── Element palette card ─────────────────────────────────────────────────────
function PaletteCard({ config, onAdd }: { config: BlockConfig; onAdd: () => void }) {
  const { addBlock, selectBlock, page, activeRouteId } = useEditorStore();
  const projectName = page?.title || "PageCraft";
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${config.type}`,
    data: { type: "palette", blockType: config.type },
  });
  const Icon = getIcon(config.icon) ?? Square2StackIcon;

  function doAdd() {
    const rawBlock = createBlock(config.type);
    const newBlock = injectProjectName(rawBlock, projectName);
    addBlock(newBlock);
    selectBlock(newBlock.id);
    onAdd();
    scrollToBlock(newBlock.id);
  }

  function handleClick() {
    // ── Singleton guard for element-level blocks ─────────────────────────
    if (SINGLETON_ELEMENT_TYPES.has(config.type)) {
      const activeRoute = page?.routes?.find(r => r.id === activeRouteId);
      const content = activeRoute?.content ?? page?.content ?? [];
      if (content.some(b => b.type === config.type)) {
        setShowConfirm(true);
        return;
      }
    }
    doAdd();
  }

  return (<>
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

    {showConfirm && (
      <DarkConfirmModal
        title={`Already have a ${config.label}`}
        description={`This page already has a ${config.label} block. Adding another one is unusual — are you sure?`}
        confirmLabel="Yes, Add Another"
        onConfirm={() => { setShowConfirm(false); doAdd(); }}
        onCancel={() => setShowConfirm(false)}
      />
    )}
  </>
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