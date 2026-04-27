"use client";

import type { BlockConfig, SectionTemplate } from "@/types";
import * as React from "react";
import { createPortal } from "react-dom";
import { useDraggable } from "@dnd-kit/core";
import {
  MagnifyingGlassIcon, XMarkIcon, PlusIcon, FaceFrownIcon,
  ChevronRightIcon, ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconButton } from "@/components/ui/IconButton";
import { getIcon } from "@/lib/utils/icons";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { BLOCK_TYPES, createBlock, injectProjectName } from "@/lib/config/blocks";
import { SECTION_TEMPLATES } from "@/lib/config/sections";
import { useEditorStore } from "@/stores/editorStore";
import Image from "next/image";

// ─── Category display order ───────────────────────────────────────────────────
export const CATEGORY_ORDER = ["Navigation", "Hero", "Grid", "Logos", "Team", "Gallery", "Features", "Stats", "Legal", "Pricing", "Testimonial", "FAQ", "Contact", "CTA", "Footer"];

export const CATEGORY_ICONS: Record<string, string> = {
  Navigation: "🧭", Hero: "⭐", Grid: "🧇", Logos: "🏷️", Team: "👥",
  Gallery: "🖼️", Features: "✨", Stats: "📊", Legal: "⚖️", Pricing: "💰",
  Testimonial: "💬", Contact: "📬", Footer: "📄", FAQ: "❓", CTA: "⚡",
};

export const SINGLETON_CATEGORIES = new Set([
  "Navigation", // one nav per page (also handled as globalBlock)
  "Footer",     // one footer per page (also handled as globalBlock)
  "Contact",    // typically one contact form
  "Pricing",    // typically one pricing table
]);

export const SINGLETON_ELEMENT_TYPES = new Set([
  "accordion",     // FAQ / accordion — one per page is enough
  "contactForm",   // Contact form — one per page
  "deleteAccount", // Delete account block — one per page
]);

export const SECTION_COVERED_TYPES = new Set<string>(
  SECTION_TEMPLATES.flatMap(t => {
    try { return [t.create().type]; } catch { return []; }
  })
);

const PREVIEW_SCALE = 0.25;


export function scrollToBlock(blockId: string) {
  if (!blockId) return;

  // Multiple attempts to ensure the DOM has updated
  const attemptScroll = (retryCount = 0) => {
    const el =
      document.getElementById(blockId) ||
      document.getElementById(`block-${blockId}`) ||
      document.querySelector(`[data-block-id="${blockId}"]`);

    if (el) {
      const rect = el.getBoundingClientRect();
      const isLarge = rect.height > window.innerHeight * 0.8;

      el.scrollIntoView({
        behavior: "smooth",
        block: isLarge ? "start" : "center",
        inline: "nearest"
      });

      // Flash highlight effect
      const originalOutline = el.style.outline;
      const originalTransition = el.style.transition;

      el.style.transition = "outline 0.2s ease";
      el.style.outline = "4px solid var(--primary)";

      setTimeout(() => {
        el.style.outline = "0px solid var(--primary)";
        setTimeout(() => {
          el.style.outline = originalOutline;
          el.style.transition = originalTransition;
        }, 300);
      }, 1000);

    } else if (retryCount < 8) {
      setTimeout(() => attemptScroll(retryCount + 1), 150);
    }
  };

  setTimeout(() => attemptScroll(0), 100);
}

export function findExistingInCategory(content: any[], category: string): boolean {
  const typesInCategory = new Set(
    SECTION_TEMPLATES
      .filter(t => t.category === category)
      .flatMap(t => { try { return [t.create().type]; } catch { return []; } })
  );
  return content.some(b => typesInCategory.has(b.type));
}

export function DarkConfirmModal({
  title,
  description,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
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
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, flexShrink: 0, borderRadius: 12,
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ExclamationTriangleIcon style={{ width: 20, height: 20, color: "#f59e0b" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3 }}>{title}</p>
            <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#64748b", lineHeight: 1.6 }}>{description}</p>
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button
            onClick={onCancel}
            style={{ height: 40, padding: "0 18px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            style={{ height: 40, padding: "0 22px", borderRadius: 12, background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,158,11,0.2)" }}
          >Add as New Section</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function SectionPreview({ template, scale = PREVIEW_SCALE }: { template: SectionTemplate; scale?: number }) {
  return (
    <div className="light" style={{
      width: "100%",
      // aspectRatio: 1 / 1,
      height: 200,
      overflow: "hidden",
      pointerEvents: "none",
      background: "#f8fafc",
      position: "relative",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: 5
    }}>
      {template.previewImage ? (
        <Image
          src={template.previewImage}
          alt={template.name}
          fill
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            pointerEvents: "none",
            backgroundColor: "transparent",
          }}

        />
      ) : (
        <div
          style={{
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
            pointerEvents: "none",
            color: "#0f172a",
            fontFamily: "Inter, system-ui, sans-serif",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          dangerouslySetInnerHTML={{ __html: template.preview }}
        />
      )}
    </div>
  );
}

export function DrawerSectionCard({ template, onAdd }: { template: SectionTemplate; onAdd: (block: any) => void }) {
  const { page, activeRouteId } = useEditorStore();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template:${template.id}`,
    data: { type: "section", templateId: template.id },
  });

  const projectName = page?.title || "PageCraft";

  function doAdd() {
    const rawBlock = template.create();
    // Inject templateId so we can track exactly which template was used
    (rawBlock as any).templateId = template.id;
    const newBlock = injectProjectName(rawBlock, projectName);
    onAdd(newBlock);
    scrollToBlock(newBlock.id);
  }

  function handleClick() {
    if (isAlreadyInPage) {
      setShowConfirm(true);
      return;
    }
    doAdd();
  }

  const SCALE = PREVIEW_SCALE;

  const activeRoute = page?.routes?.find(r => r.id === activeRouteId);
  const content = activeRoute?.content ?? page?.content ?? [];

  // Singleton categories (Nav, Footer) check the whole category.
  // Others check for the specific templateId to avoid marking all as "Added".
  const isSingleton = SINGLETON_CATEGORIES.has(template.category);
  const isAlreadyInPage = isSingleton
    ? !!findExistingInCategory(content, template.category)
    : content.some(block => (block as any).templateId === template.id);

  // Symbolic badges based on template ID for demonstration
  const isPopular = template.id.includes('split') || template.id.includes('logo-left');
  const isNew = template.id.includes('glass') || template.id.includes('bento');

  return (<>
    {showConfirm && (
      <DarkConfirmModal
        title={`${template.category} Already Added`}
        description={isSingleton
          ? `You already have a ${template.category} on this page. Do you want to add another one?`
          : `You already have this specific ${template.category} design. Do you want to add a second copy?`}
        onConfirm={() => { setShowConfirm(false); doAdd(); }}
        onCancel={() => setShowConfirm(false)}
      />
    )}
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      style={{
        borderRadius: 14, border: "1px solid var(--border)",
        background: "var(--surface)", cursor: "pointer",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none", overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
        position: "relative"
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px -12px rgba(0,0,0,0.2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--primary-light)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
    >
      {/* Premium Badges */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, display: "flex", gap: 8 }}>
        {isPopular && (
          <div style={{ background: "rgba(59,130,246,0.9)", backdropFilter: "blur(4px)", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", gap: 4, boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} /> MOST USED
          </div>
        )}
        {isNew && (
          <div style={{ background: "rgba(34,197,94,0.9)", backdropFilter: "blur(4px)", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", gap: 4, boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} /> RECENTLY ADDED
          </div>
        )}
      </div>

      {isAlreadyInPage && (
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
          <div style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} /> ALREADY ADDED
          </div>
        </div>
      )}

      <SectionPreview template={template} scale={SCALE} />
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{template.name}</span>
        <div style={{ width: 28, height: 28, borderRadius: 10, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 10px rgba(99,102,241,0.3)" }}>
          <PlusIcon style={{ width: 16, height: 16, color: "#fff" }} />
        </div>
      </div>
    </div>
  </>);
}

export function PaletteCard({ config, onAdd }: { config: BlockConfig; onAdd: (block: any) => void }) {
  const { page, activeRouteId } = useEditorStore();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${config.type}`,
    data: { type: "palette", blockType: config.type },
  });
  const Icon = getIcon(config.icon) ?? Square2StackIcon;
  const projectName = page?.title || "PageCraft";

  function doAdd() {
    const rawBlock = createBlock(config.type);
    const newBlock = injectProjectName(rawBlock, projectName);
    onAdd(newBlock);
    scrollToBlock(newBlock.id);
  }

  function handleClick() {
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
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        padding: "20px 16px", borderRadius: 18,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        cursor: "pointer", opacity: isDragging ? 0.4 : 1,
        userSelect: "none", transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        height: "fit-content"
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--primary-light)"; (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: "#fff",
        boxShadow: "0 8px 16px rgba(99,102,241,0.25)",
      }}>
        <Icon style={{ width: 22, height: 22 }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textAlign: "center", letterSpacing: "-0.01em" }}>{config.label}</span>
    </div>
    {showConfirm && (
      <DarkConfirmModal
        title={`Already have a ${config.label}`}
        description={`This page already has a ${config.label} block. Adding another one is unusual.`}
        onConfirm={() => { setShowConfirm(false); doAdd(); }}
        onCancel={() => setShowConfirm(false)}
      />
    )}
  </>);
}

export function EmptyPaletteState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "32px 16px", color: "var(--text-subtle)" }}>
      <FaceFrownIcon style={{ width: 24, height: 24, strokeWidth: 1.5 }} />
      <span style={{ fontSize: 12 }}>Nothing found</span>
    </div>
  );
}

export function LibraryHeader({
  title,
  search,
  setSearch,
  placeholder = "Search...",
  children,
  onClose,
  maxWidth = 1600
}: {
  title: string;
  search: string;
  setSearch: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  maxWidth?: number;
}) {
  return (
    <div style={{
      padding: "20px 32px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(255,255,255,0.01)",
      backdropFilter: "blur(40px) saturate(160%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 20,
      position: "relative"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        width: "100%",
        maxWidth,
        padding: "0 10px", // Breathing room for small screens
        flexWrap: "wrap" // Allow wrap on very small devices
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 800,
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          flexShrink: 0
        }}>
          {title}
        </h2>
        <SearchInput
          value={search}
          onChange={v => setSearch(v)}
          placeholder={placeholder}
          autoFocus
        />
      </div>
      {children}
      {onClose && (
        <IconButton
          icon={<XMarkIcon />}
          onClick={onClose}
          style={{ position: "absolute", right: 24, top: 24 }}
          title="Close"
        />
      )}
    </div>
  );
}

export function SectionsPanel({ onAdd, isGrid = false }: { onAdd: (block: any) => void; isGrid?: boolean }) {
  const [search, setSearch] = React.useState("");
  const [drawerCategory, setDrawerCategory] = React.useState<string | null>("Hero");
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

  // ─── Premium Horizontal Layout (The Designer's Choice) ──────────────────
  if (isGrid) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", background: "var(--bg-secondary)", borderRadius: 24, overflow: "hidden", border: "1px solid var(--border)" }}>
        <LibraryHeader
          title="Explore Library"
          search={search}
          setSearch={setSearch}
          placeholder="Search templates or blocks..."
        >
          {/* Premium Centered Tab Bar */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center", // Centered categories
            gap: 10,
            padding: 2
          }}>
            {filteredCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setDrawerCategory(drawerCategory === cat ? null : cat)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 18px", borderRadius: 14, border: "1px solid",
                  borderColor: drawerCategory === cat ? "var(--primary)" : "transparent",
                  background: drawerCategory === cat ? "var(--primary)" : "var(--surface)",
                  color: drawerCategory === cat ? "#fff" : "var(--text)",
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  fontSize: 14, fontWeight: 700,
                  boxShadow: drawerCategory === cat ? "0 8px 20px rgba(99,102,241,0.25)" : "none",
                  transform: drawerCategory === cat ? "scale(1.05)" : "scale(1)"
                }}
              >
                <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[cat] ?? "📦"}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </LibraryHeader>

        {/* Expansive Results Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 60px" }}>
          {displayCategory ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 1600, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                <span style={{ fontSize: 48, lineHeight: 1 }}>{CATEGORY_ICONS[displayCategory]}</span>
                <div style={{ paddingBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em" }}>{displayCategory}</h3>
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, fontWeight: 500, marginTop: 4 }}>{sectionsByCategory[displayCategory]?.length ?? 0} high-fidelity templates ready to use</p>
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24
              }}>
                {(sectionsByCategory[displayCategory] ?? []).map(tpl => (
                  <DrawerSectionCard key={tpl.id} template={tpl} onAdd={onAdd} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, color: "var(--text-muted)" }}>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.01em" }}>Welcome to the Library</h3>
                <p style={{ margin: "12px 0 0", fontSize: 15, color: "var(--text-muted)", maxWidth: 360, lineHeight: 1.6 }}>Select a category from the premium navigation above to start exploring beautiful sections and components.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Original Sidebar Layout (Fallback) ──────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100%", width: "100%", background: "var(--bg-secondary)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ width: 190, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid var(--border)" }}>
          <SearchInput
            value={search}
            onChange={v => setSearch(v)}
            placeholder="Search…"
            autoFocus
            width="100%"
            style={{ borderRadius: 7, padding: "5px 8px 5px 27px", fontSize: 12 }}
          />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {filteredCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setDrawerCategory(drawerCategory === cat ? null : cat)}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, border: "none", background: drawerCategory === cat ? "var(--primary)" : "transparent", cursor: "pointer", textAlign: "left", width: "100%", transition: "background 0.12s" }}
            >
              <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[cat] ?? "📦"}</span>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: drawerCategory === cat ? "#fff" : "var(--text)" }}>{cat}</span>
              <span style={{ fontSize: 10, borderRadius: 10, padding: "1px 5px", color: drawerCategory === cat ? "rgba(255,255,255,0.7)" : "var(--text-subtle)", background: drawerCategory === cat ? "rgba(255,255,255,0.2)" : "var(--surface-hover)" }}>{sectionsByCategory[cat]?.length ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {displayCategory ? (
          <>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[displayCategory]}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", flex: 1 }}>{displayCategory}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
              {(sectionsByCategory[displayCategory] ?? []).map(tpl => (
                <DrawerSectionCard key={tpl.id} template={tpl} onAdd={onAdd} />
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

export function ElementsPanel({ onAdd, isGrid = false }: { onAdd: (block: any) => void; isGrid?: boolean }) {
  const [search, setSearch] = React.useState("");
  const filteredElements = React.useMemo(
    () => BLOCK_TYPES.filter(b => {
      if (b.hidden) return false;
      // Layout Grid is a special primitive that should be in Elements even if covered by sections
      if (b.type === "grid") return true;
      if (SECTION_COVERED_TYPES.has(b.type)) return false;
      return !search || b.label.toLowerCase().includes(search.toLowerCase());
    }),
    [search]
  );

  if (isGrid) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", background: "var(--bg-secondary)", borderRadius: 24, overflow: "hidden", border: "1px solid var(--border)" }}>
        <LibraryHeader
          title="Explore Elements"
          search={search}
          setSearch={setSearch}
          placeholder="Search elements..."
        />

        {/* Expansive Results Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 60px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 24,
            maxWidth: 1600,
            margin: "0 auto"
          }}>
            {filteredElements.map(config => (
              <PaletteCard key={config.type} config={config} onAdd={onAdd} />
            ))}
          </div>
          {filteredElements.length === 0 && <EmptyPaletteState />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", background: "var(--bg-secondary)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid var(--border)" }}>
        <SearchInput
          value={search}
          onChange={v => setSearch(v)}
          placeholder="Search elements…"
          autoFocus
          width="100%"
          style={{ borderRadius: 7, padding: "5px 8px 5px 27px", fontSize: 12 }}
        />
      </div>
      <div style={{
        // flex: 1,
        maxHeight: isGrid ? "none" : 260,
        overflowY: "auto",
        padding: "12px",
        display: isGrid ? "grid" : "flex",
        gridTemplateColumns: isGrid ? "repeat(auto-fill, minmax(200px, 1fr))" : "none",
        flexDirection: "column",
        gap: isGrid ? 12 : 3
      }}>
        {filteredElements.map(config => (
          <PaletteCard key={config.type} config={config} onAdd={onAdd} />
        ))}
        {filteredElements.length === 0 && <EmptyPaletteState />}
      </div>
    </div>
  );
}
