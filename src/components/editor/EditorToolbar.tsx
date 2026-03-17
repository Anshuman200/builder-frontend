"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  CameraIcon,
} from "@heroicons/react/24/outline";
import { Popover, Dropdown } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { slugify } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { pagesApi } from "@/lib/api/client";
import { clearLocalDraft } from "@/lib/utils/storage";
import { useToasts } from "@/hooks/useToasts";
import { useUpdatePage, useCreatePage, usePublishPage } from "@/lib/api/queries";
import CapturePreviewModal from "@/components/editor/CapturePreviewModal";


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
  const [showCapturePicker, setShowCapturePicker] = useState(false);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>((page as any)?.thumbnail || null);
  const [capturedThumbnails, setCapturedThumbnails] = useState<string[]>((page as any)?.thumbnails || []);

  const updateMutation = useUpdatePage();
  const createMutation = useCreatePage();
  const publishMutation = usePublishPage();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Helper to format payload for backend
  const getPlainPayload = (thumbnailUrl?: string | null) => {
    if (!page) return null;

    const payload: any = {
      title: page.title,
      slug: page.slug,
      content: page.content || [],
      meta: page.meta || {},
      category: page.category || 'Other',
      status: page.status || 'DRAFT'
    };

    if (thumbnailUrl !== undefined) {
      payload.thumbnail = thumbnailUrl;
    }

    return payload;
  };

  // Handle thumbnail selection from capture or media library
  const handleUpdateThumbnails = async (newThumbnails: string[], active: string | null) => {
    setCapturedThumbnails(newThumbnails);
    setCurrentThumbnail(active);
    if (!pageId || pageId.length < 24) return;
    try {
      await updateMutation.mutateAsync({
        id: pageId,
        thumbnail: active || undefined,
        thumbnails: newThumbnails,
      } as any);
      success('Thumbnail saved!');
    } catch (e) {
      console.error('Thumbnail save failed', e);
    }
  };


  // Auto-save effect
  useEffect(() => {
    if (!user || !pageId || !isDirty || isSaving) return;
    if (pageId.length < 24) return;

    const timeoutId = setTimeout(async () => {
      try {
        const payload = getPlainPayload();
        if (!payload) return;
        await updateMutation.mutateAsync({ id: pageId, ...payload });
        markClean();
        clearLocalDraft(pageId);
      } catch (e) {
        console.error("Auto-save failed", e);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [page, user, pageId, isDirty, isSaving, markClean]);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘Z or Ctrl+Z for Undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      // ⌘⇧Z or Ctrl+Shift+Z or ⌘Y for Redo
      if (((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) || ((e.metaKey || e.ctrlKey) && e.key === "y")) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // Sync thumbnail when page loads from API
  useEffect(() => {
    if (page) {
      if ((page as any).thumbnail && !currentThumbnail) {
        setCurrentThumbnail((page as any).thumbnail);
      }
      if ((page as any).thumbnails?.length > 0 && capturedThumbnails.length === 0) {
        setCapturedThumbnails((page as any).thumbnails);
      }
    }
  }, [page]);

  async function handleSave() {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!pageId || !page) return;

    setIsSaving(true);
    try {
      if (pageId.length < 24) {
        const payload = getPlainPayload();
        if (!payload) return;
        const res = await createMutation.mutateAsync(payload);
        const newId = (res as any).data.page._id;
        markClean();
        clearLocalDraft(pageId);
        clearLocalDraft(newId);
        router.replace(`/editor/${newId}`);
        return;
      }
      const payload = getPlainPayload();
      if (!payload) return;
      await updateMutation.mutateAsync({ id: pageId, ...payload });
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
        const payload = getPlainPayload();
        if (!payload) return;

        if (pageId.length < 24) {
          const res = await createMutation.mutateAsync(payload);
          finalPageId = (res as any).data.page._id;
          markClean();
          clearLocalDraft(pageId);
          clearLocalDraft(finalPageId);
        } else {
          await updateMutation.mutateAsync({ id: pageId, ...payload });
          markClean();
          clearLocalDraft(pageId);
        }
      }

      // Then publish
      await publishMutation.mutateAsync(finalPageId);
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

  async function handleLogoClick(e: React.MouseEvent) {
    e.preventDefault();
    const target = !user ? "/" : (user as any).role === 'admin' ? "/admin" : "/home";
    
    // Force commit title if currently editing
    if (editingTitle) {
      const t = titleDraft.trim() || "Untitled Page";
      updateTitle(t);
      setEditingTitle(false);
    }
    
    if (isDirty && user && pageId && pageId.length >= 24) {
      setIsSaving(true);
      try {
        const payload = getPlainPayload();
        if (payload) {
          await updateMutation.mutateAsync({ id: pageId, ...payload });
          markClean();
          clearLocalDraft(pageId);
        }
      } catch (e) {
        console.error("Save before navigation failed", e);
      } finally {
        setIsSaving(false);
      }
    }
    router.push(target);
  }

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
        <a 
          href={!user ? "/" : (user as any).role === 'admin' ? "/admin" : "/home"} 
          onClick={handleLogoClick}
          style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ZapIcon style={{ width: 14, height: 14 }} color="#fff" />
          </div>
        </a>
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

        {/* Thumbnail capture button */}
        {user && (
          <button
            onClick={() => setShowCapturePicker(true)}
            title="Capture page thumbnail"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px",
              background: currentThumbnail ? "rgba(99,102,241,0.15)" : "var(--surface)",
              color: currentThumbnail ? "#818cf8" : "var(--text-muted)",
              border: `1px solid ${currentThumbnail ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              position: "relative",
            }}
          >
            {currentThumbnail ? (
              <span style={{ position: "relative", width: 14, height: 14, flexShrink: 0 }}>
                <img
                  src={currentThumbnail}
                  alt=""
                  style={{ width: 14, height: 14, borderRadius: 3, objectFit: "cover" }}
                />
              </span>
            ) : (
              <CameraIcon style={{ width: 13, height: 13 }} />
            )}
            Thumbnail
          </button>
        )}

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
          <Popover
            placement="bottomRight"
            trigger="click"
            styles={{ root: { background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '4px', maxWidth: '280px' } }}
            content={
              <div className="w-56">
                <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                  <p className="text-(--text)" style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Page Settings</p>
                </div>

                <div style={{ padding: "4px 8px" }}>
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

                  {user && (
                    <SettingField label="Page Thumbnail">
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {currentThumbnail ? (
                          <div style={{ position: "relative", borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)" }}>
                            <img
                              src={currentThumbnail}
                              alt="Thumbnail"
                              style={{ width: "100%", height: 70, objectFit: "cover", objectPosition: "top", display: "block" }}
                            />
                          </div>
                        ) : (
                          <div style={{
                            height: 50, borderRadius: 6,
                            border: "1.5px dashed var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, color: "var(--text-muted)"
                          }}>
                            No thumbnail set
                          </div>
                        )}
                        <button
                          onClick={() => setShowCapturePicker(true)}
                          style={{
                            padding: "5px 10px",
                            background: "var(--surface)",
                            color: "var(--text)",
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            width: "100%",
                          }}
                        >
                          {currentThumbnail ? "Change Thumbnail" : "Choose Thumbnail"}
                        </button>
                      </div>
                    </SettingField>
                  )}
                </div>
              </div>
            }
          >
            <div>
              <IconBtn title="Page settings">
                <AdjustmentsHorizontalIcon style={{ width: 14, height: 14, color: "currentColor" }} />
              </IconBtn>
            </div>
          </Popover>
        </div>

        {/* User Menu Popover (if logged in) */}
        {user && (
          <div style={{ position: "relative" }}>
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'header',
                    label: (
                      <div style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "inherit" }}>{user?.name || "User"}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
                      </div>
                    ),
                    disabled: true,
                    style: { cursor: 'default' }
                  },
                  {
                    key: 'logout',
                    onClick: async () => {
                      await logout();
                      router.push("/");
                    },
                    label: (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444", fontSize: "0.85rem", fontWeight: 500 }}>
                        <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
                        Log out
                      </div>
                    ),
                  }
                ]
              }}
            >
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
            </Dropdown>
          </div>
        )}
      </div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />

      {/* Capture Preview Modal */}
      {user && pageId && pageId.length >= 24 && (
        <CapturePreviewModal
          open={showCapturePicker}
          onClose={() => setShowCapturePicker(false)}
          pageId={pageId}
          previewUrl={typeof window !== 'undefined' ? `${window.location.origin}/preview/${pageId}` : `/preview/${pageId}`}
          currentThumbnail={currentThumbnail}
          existingThumbnails={capturedThumbnails}
          onSelect={(url) => { setCurrentThumbnail(url); }}
          onUpdateThumbnails={handleUpdateThumbnails}
        />
      )}
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
