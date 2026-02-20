"use client";

import { useRouter } from "next/navigation";
import {
  Undo2, Redo2, Monitor, Tablet, Smartphone,
  Save, Globe, Eye, ArrowLeft, Zap, Loader2,
} from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface ToolbarProps {
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  onPreview: () => void;
  saving: boolean;
  publishing: boolean;
}

export function Toolbar({ onSave, onPublish, onPreview, saving, publishing }: ToolbarProps) {
  const router = useRouter();
  const {
    page, isDirty, historyIndex, history,
    undo, redo, setViewMode, viewMode,
  } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const isPublished = page?.status === "PUBLISHED";

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: 52,
      background: "var(--bg)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 0.75rem",
      gap: "0.5rem",
      zIndex: 200,
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Back button + Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: "0.35rem",
            background: "none", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "0.35rem 0.625rem",
            cursor: "pointer", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 600,
          }}
        >
          <ArrowLeft size={13} /> Dashboard
        </button>

        <div style={{
          width: 1, height: 20, background: "var(--border)", flexShrink: 0,
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={13} color="white" fill="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--text)" }}>
            {page?.title ?? "Editor"}
          </span>
          {isDirty && (
            <span style={{
              fontSize: "0.65rem", fontWeight: 600,
              padding: "1px 6px",
              background: "var(--warning)",
              color: "white",
              borderRadius: "var(--radius-full)",
            }}>
              Unsaved
            </span>
          )}
        </div>
      </div>

      {/* Center — view mode + undo/redo */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
        {/* Undo/Redo */}
        <div style={{ display: "flex", gap: "0.125rem" }}>
          <ToolbarIconBtn
            icon={<Undo2 size={15} />}
            label="Undo"
            onClick={undo}
            disabled={!canUndo}
          />
          <ToolbarIconBtn
            icon={<Redo2 size={15} />}
            label="Redo"
            onClick={redo}
            disabled={!canRedo}
          />
        </div>

        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        {/* View mode */}
        <div style={{
          display: "flex", background: "var(--surface)",
          borderRadius: "var(--radius)", padding: "2px", gap: "2px",
        }}>
          {([
            { mode: "desktop" as const, icon: <Monitor size={14} />, label: "Desktop" },
            { mode: "tablet" as const, icon: <Tablet size={14} />, label: "Tablet" },
            { mode: "mobile" as const, icon: <Smartphone size={14} />, label: "Mobile" },
          ]).map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={label}
              style={{
                padding: "0.3rem 0.5rem",
                borderRadius: "calc(var(--radius) - 2px)",
                border: "none", cursor: "pointer",
                background: viewMode === mode ? "var(--bg)" : "transparent",
                color: viewMode === mode ? "var(--primary)" : "var(--text-muted)",
                boxShadow: viewMode === mode ? "var(--shadow-sm)" : "none",
                display: "flex", alignItems: "center",
                transition: "all var(--transition)",
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <ThemeToggle />

        <button
          onClick={onPreview}
          style={ghostBtn}
          title="Preview page"
        >
          <Eye size={14} /> Preview
        </button>

        <button
          onClick={onSave}
          disabled={saving || !isDirty}
          style={{
            ...ghostBtn,
            opacity: saving || !isDirty ? 0.5 : 1,
            cursor: saving || !isDirty ? "not-allowed" : "pointer",
          }}
        >
          {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
          {saving ? "Saving…" : "Save"}
        </button>

        <button
          onClick={onPublish}
          disabled={publishing}
          style={{
            display: "flex", alignItems: "center", gap: "0.375rem",
            padding: "0.4rem 0.875rem",
            background: isPublished ? "var(--surface)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: isPublished ? "var(--text)" : "white",
            border: isPublished ? "1px solid var(--border)" : "none",
            borderRadius: "var(--radius)",
            fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
            opacity: publishing ? 0.7 : 1,
            transition: "all var(--transition)",
          }}
        >
          {publishing ? (
            <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Globe size={13} />
          )}
          {publishing ? "Working…" : isPublished ? "Unpublish" : "Publish"}
        </button>
      </div>
    </header>
  );
}

function ToolbarIconBtn({
  icon, label, onClick, disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        padding: "0.3rem 0.4rem",
        background: "none", border: "none",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "var(--text-subtle)" : "var(--text-muted)",
        display: "flex", alignItems: "center",
        transition: "all var(--transition)",
      }}
    >
      {icon}
    </button>
  );
}

const ghostBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.375rem",
  padding: "0.4rem 0.75rem",
  background: "transparent",
  color: "var(--text-muted)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
  transition: "all var(--transition)",
};
