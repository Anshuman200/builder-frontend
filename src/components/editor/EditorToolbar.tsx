"use client";

import { useState, useRef, useEffect } from "react";
import {
  BoltIcon as ZapIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  AdjustmentsHorizontalIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { slugify } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { pagesApi } from "@/lib/api/client";
import { clearLocalDraft } from "@/lib/storage";
import { useToasts } from "@/hooks/useToasts";

export default function EditorToolbar() {
  const {
    page, viewMode, isDirty,
    historyIndex, history,
    setViewMode, undo, redo,
    updateTitle, updateSlug, updateMeta, markClean,
  } = useEditorStore();
  const { pageId } = useParams<{ pageId: string }>() ?? {};
  const router = useRouter();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { user, logout } = useAuth();
  const { success, error: toastError, info } = useToasts();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Helper to format payload for backend
  const formatPayload = () => ({
    title: page?.title || "Untitled",
    meta: page?.meta || {},
    theme: page?.theme || {},
    isTemplate: page?.isTemplate,
    isPublic: page?.isPublic,
    isLocked: page?.isLocked,
    category: page?.category,
    content: {
      root: {
        id: "root",
        type: "Canvas",
        props: {},
        children: page?.content || []
      }
    }
  });

  // Auto-save effect
  useEffect(() => {
    if (!user || !pageId || !isDirty || isSaving) return;
    if (pageId.length < 24) return; // Do not auto-save guest ids; require manual save to create

    const timeoutId = setTimeout(async () => {
      try {
        await pagesApi.update(pageId, formatPayload());
        markClean();
        clearLocalDraft(pageId);
      } catch (e) {
        console.error("Auto-save failed", e);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [page, user, pageId, isDirty, isSaving, markClean]);

  async function handleSave() {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!pageId || !page) return;

    setIsSaving(true);
    try {
      if (pageId.length < 24) {
        // Create new page in DB to replace local guest ID
        const res = await pagesApi.create(formatPayload());
        const newId = res.data.page._id;
        markClean();
        clearLocalDraft(pageId);
        clearLocalDraft(newId);
        router.replace(`/editor/${newId}`);
        return;
      }
      await pagesApi.update(pageId, formatPayload());
      markClean();
      clearLocalDraft(pageId);
    } catch (e) {
      console.error("Manual save failed", e);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!pageId || !page) return;

    setIsPublishing(true);
    try {
      let finalPageId = pageId;
      // First save draft
      if (isDirty || pageId.length < 24) {
        if (pageId.length < 24) {
          const res = await pagesApi.create(formatPayload());
          finalPageId = res.data.page._id;
          markClean();
          clearLocalDraft(pageId);
          clearLocalDraft(finalPageId);
        } else {
          await pagesApi.update(pageId, formatPayload());
          markClean();
          clearLocalDraft(pageId);
        }
      }

      // Then publish
      await pagesApi.publish(finalPageId);
      alert("Page published successfully!");

      if (finalPageId !== pageId) {
        router.replace(`/editor/${finalPageId}`);
      }
    } catch (e: any) {
      console.error("Publish failed", e);
      toastError(e.message || "Error publishing page.");
    } finally {
      setIsPublishing(false);
    }
  }

  function openPreview() {
    if (!pageId) return;
    const previewUrl = typeof window !== "undefined" ? `${window.location.origin}/preview/${pageId}` : `/preview/${pageId}`;

    // Open immediately to avoid popup blockers
    const newWin = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;

    if (page) {
      fetch(`/api/preview/${pageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      }).then(() => {
        if (newWin) newWin.location.href = previewUrl;
      }).catch((e) => {
        console.error(e);
        if (newWin) newWin.location.href = previewUrl;
      });
    } else if (newWin) {
      newWin.location.href = previewUrl;
    }
  }

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
    { key: "desktop" as const, icon: ComputerDesktopIcon, label: "Desktop" },
    { key: "tablet" as const, icon: DeviceTabletIcon, label: "Tablet (768px)" },
    { key: "mobile" as const, icon: DevicePhoneMobileIcon, label: "Mobile (390px)" },
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
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ZapIcon style={{ width: 14, height: 14 }} color="#fff" />
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
            <Icon style={{ width: 14, height: 14 }} />
          </button>
        ))}
      </div>

      {/* Right — save indicator, undo/redo, settings */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>

        {/* Save status */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: isDirty ? "#f59e0b" : "#10b981", display: "inline-block" }} />
          {isDirty ? "Unsaved" : "Saved"}
        </div>

        {/* Undo / Redo */}
        <div style={{ display: "flex", gap: 2 }}>
          <IconBtn onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
            <ArrowUturnLeftIcon style={{ width: 14, height: 14 }} />
          </IconBtn>
          <IconBtn onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">
            <ArrowUturnRightIcon style={{ width: 14, height: 14 }} />
          </IconBtn>
        </div>

        {/* Save Draft button */}
        <button
          onClick={handleSave}
          disabled={isSaving || (!isDirty && !!user)}
          title="Save Draft"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px",
            background: "var(--surface)",
            color: (isDirty || !user) ? "var(--text)" : "var(--text-muted)",
            border: "1px solid var(--border)",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 600,
            cursor: isSaving || (!isDirty && !!user) ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {isSaving ? "Saving..." : "Save Draft"}
        </button>

        {/* Publish button */}
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          title="Publish Live"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 600,
            cursor: isPublishing ? "not-allowed" : "pointer",
            letterSpacing: "0.01em",
            boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
          }}
        >
          {isPublishing ? "Publishing..." : "Publish"}
        </button>

        {/* Preview button */}
        <button
          onClick={openPreview}
          title="Preview page"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.01em",
            boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
          }}
        >
          <EyeIcon style={{ width: 13, height: 13 }} />
          Preview
        </button>

        {/* Page settings popover */}
        <div style={{ position: "relative" }}>
          <Popover>
            <PopoverTrigger asChild>
              <IconBtn title="Page settings">
                <AdjustmentsHorizontalIcon style={{ width: 14, height: 14, color: "currentColor" }} />
              </IconBtn>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-56 bg-(--bg-secondary) border border-(--border) rounded-md py-1 shadow-lg z-1000"
            >
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                <p className="text-(--text)" style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Page Settings</p>
              </div>

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
                  defaultValue={page?.meta?.description || ""}
                  onBlur={(e) => updateMeta({ description: e.target.value })}
                  rows={2}
                  style={{ resize: "none" }}
                  placeholder="Brief description for search engines"
                />
              </SettingField>

              <SettingField label="OG Image URL">
                <input
                  className="input-dark"
                  defaultValue={page?.meta?.ogImage || ""}
                  onBlur={(e) => updateMeta({ ogImage: e.target.value })}
                  placeholder="https://..."
                />
              </SettingField>
            </PopoverContent>
          </Popover>
        </div>

        {/* User Menu Popover (if logged in) */}
        {user && (
          <div style={{ position: "relative" }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "linear-gradient(135deg, #10b981, #3b82f6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                    border: "2px solid var(--border)", outline: "none"
                  }}>
                  {(user?.name || user?.email || "U")[0].toUpperCase()}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 bg-(--surface) border border-(--border) rounded-xl p-1 shadow-xl z-1000 text-(--text)"
              >
                <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{user?.name || "User"}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
                </div>
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.preventDefault();
                    await logout();
                    router.push("/");
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    cursor: "pointer", color: "#ef4444", fontSize: "0.85rem", fontWeight: 500,
                  }}
                  className="focus:bg-(--bg) cursor-pointer rounded-lg p-2"
                >
                  <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />
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
