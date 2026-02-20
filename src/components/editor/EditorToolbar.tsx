"use client";

import { useState, useRef } from "react";
import {
  Zap, Monitor, Tablet, Smartphone,
  Undo2, Redo2, Settings2, Circle,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { useEditorStore } from "@/stores/editorStore";
import { slugify } from "@/lib/utils";

export default function EditorToolbar() {
  const {
    page, viewMode, isDirty,
    historyIndex, history,
    setViewMode, undo, redo,
    updateTitle, updateSlug, updateMeta,
  } = useEditorStore();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  function startTitleEdit() {
    setTitleDraft(page?.title || "");
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }

  function commitTitle() {
    const t = titleDraft.trim() || "Untitled Page";
    updateTitle(t);
    setEditingTitle(false);
  }

  const viewModes = [
    { key: "desktop" as const, icon: Monitor, label: "Desktop" },
    { key: "tablet" as const, icon: Tablet, label: "Tablet (768px)" },
    { key: "mobile" as const, icon: Smartphone, label: "Mobile (390px)" },
  ];

  return (
    <header style={{
      height: 52,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px",
      gap: 12,
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)",
      zIndex: 50,
    }}>

      {/* Left — logo + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={14} color="#fff" fill="#fff" />
          </div>
        </Link>
        <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />
        {editingTitle ? (
          <input
            ref={titleInputRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") setEditingTitle(false); }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--primary)",
              borderRadius: 6,
              padding: "3px 8px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text)",
              outline: "none",
              minWidth: 0,
              maxWidth: 200,
            }}
          />
        ) : (
          <button
            onClick={startTitleEdit}
            title="Click to rename"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text)",
              padding: "3px 6px",
              borderRadius: 6,
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {page?.title || "Untitled Page"}
          </button>
        )}
      </div>

      {/* Center — viewport switcher */}
      <div style={{ display: "flex", gap: 2, background: "var(--surface)", borderRadius: 8, padding: 3 }}>
        {viewModes.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            title={label}
            onClick={() => setViewMode(key)}
            style={{
              width: 32, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: viewMode === key ? "var(--primary)" : "transparent",
              color: viewMode === key ? "#fff" : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* Right — save indicator, undo/redo, settings */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>

        {/* Save status */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
          <Circle
            size={7}
            fill={isDirty ? "#f59e0b" : "#10b981"}
            color={isDirty ? "#f59e0b" : "#10b981"}
          />
          {isDirty ? "Unsaved" : "Saved"}
        </div>

        {/* Undo / Redo */}
        <div style={{ display: "flex", gap: 2 }}>
          <IconBtn onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
            <Undo2 size={14} />
          </IconBtn>
          <IconBtn onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">
            <Redo2 size={14} />
          </IconBtn>
        </div>

        {/* Page settings popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <IconBtn title="Page settings">
              <Settings2 size={14} />
            </IconBtn>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              style={{
                width: 280,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 16,
                boxShadow: "var(--shadow-xl)",
                zIndex: 1000,
              }}
            >
              <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 13, color: "var(--text)" }}>
                Page Settings
              </p>

              <SettingField label="Title">
                <input
                  className="input-dark"
                  defaultValue={page?.title}
                  onBlur={(e) => updateTitle(e.target.value)}
                  placeholder="Page title"
                />
              </SettingField>

              <SettingField label="Slug">
                <input
                  className="input-dark"
                  defaultValue={page?.slug}
                  onBlur={(e) => updateSlug(slugify(e.target.value))}
                  placeholder="page-slug"
                />
              </SettingField>

              <SettingField label="Meta Description">
                <textarea
                  className="input-dark"
                  defaultValue={page?.meta.description}
                  onBlur={(e) => updateMeta({ description: e.target.value })}
                  rows={2}
                  style={{ resize: "none" }}
                  placeholder="Brief description for search engines"
                />
              </SettingField>

              <SettingField label="OG Image URL">
                <input
                  className="input-dark"
                  defaultValue={page?.meta.ogImage}
                  onBlur={(e) => updateMeta({ ogImage: e.target.value })}
                  placeholder="https://..."
                />
              </SettingField>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </header>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function IconBtn({
  children, onClick, disabled, title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 32, height: 32,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "none",
        border: "none",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "var(--text-subtle)" : "var(--text-muted)",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
    >
      {children}
    </button>
  );
}

function SettingField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
