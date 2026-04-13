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
  PhotoIcon,
  TrashIcon,
  MoonIcon,
  SunIcon,
  ArrowsRightLeftIcon,
  GlobeAltIcon,
  LockClosedIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Popover, Dropdown, Drawer, Switch, ColorPicker } from "antd";
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
import BlockPalette from "./BlockPalette";
import MediaPicker from "@/components/editor/MediaPicker";
import { DEFAULT_THEME } from "@/stores/editorStore";


export default function EditorToolbar() {
  const {
    page, viewMode, isDirty,
    historyIndex, history,
    setViewMode, undo, redo,
    updateTitle, updateSlug, updateMeta, updateTheme, updatePageData, markClean,
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<"favicon" | "ogImage" | null>(null);

  const theme = page?.theme || DEFAULT_THEME;
  const colors = theme.colors || DEFAULT_THEME.colors;

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
    updatePageData({ 
      thumbnail: active, 
      thumbnails: newThumbnails 
    });

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



  // Sync / Auto-save on Login
  useEffect(() => {
    // If user just logged in and has unsaved changes, persist them!
    if (user && isDirty && !isSaving) {
      handleSave();
    }
  }, [user]);

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


  function openPreview() {
    if (!pageId) return;
    const previewUrl = typeof window !== "undefined" ? `${window.location.origin}/preview/${pageId}?capture=true` : `/preview/${pageId}?capture=true`;

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
        <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0, margin: "0 4px" }} />
        <BlockPalette />
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
          title="Save Changes"
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
          {isSaving ? "Saving..." : "Save"}
        </button>

        {/* Thumbnail capture button */}
        {user && (
          <button
            onClick={() => setShowCapturePicker(true)}
            title="Capture page thumbnail"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px",
              background: page?.thumbnail ? "rgba(99,102,241,0.15)" : "var(--surface)",
              color: page?.thumbnail ? "#818cf8" : "var(--text-muted)",
              border: `1px solid ${page?.thumbnail ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              position: "relative",
            }}
          >
            {page?.thumbnail ? (
              <span style={{ position: "relative", width: 14, height: 14, flexShrink: 0 }}>
                <img
                  src={page.thumbnail}
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

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDrawerOpen(true)}
            title="Page settings"
            style={{
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--text-muted)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <AdjustmentsHorizontalIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* User Menu / Login Button */}
        {user ? (
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
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "var(--primary)",
              color: "white",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s",
              boxShadow: "0 2px 6px rgba(99,102,241,0.25)"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Sign In
          </button>
        )}
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
        redirectOnSuccess={false}
      />

      {/* Capture Preview Modal */}
      {user && pageId && pageId.length >= 24 && (
        <CapturePreviewModal
          open={showCapturePicker}
          onClose={() => setShowCapturePicker(false)}
          pageId={pageId}
          previewUrl={typeof window !== 'undefined' ? `${window.location.origin}/preview/${pageId}?capture=true` : `/preview/${pageId}?capture=true`}
          currentThumbnail={page?.thumbnail || null}
          existingThumbnails={page?.thumbnails || []}
          onSelect={(url) => { updatePageData({ thumbnail: url }); }}
          onUpdateThumbnails={handleUpdateThumbnails}
        />
      )}

      {/* Media Picker for Favicon/OG Image */}
      <MediaPicker
        open={!!mediaPickerType}
        onClose={() => setMediaPickerType(null)}
        title={mediaPickerType === 'favicon' ? 'Select Favicon' : 'Select OG Image'}
        onSelect={(urls) => {
          const url = urls[0];
          if (mediaPickerType === 'favicon') updateMeta({ favicon: url });
          else if (mediaPickerType === 'ogImage') updateMeta({ ogImage: url });
        }}
        type={mediaPickerType ? "image" : "all"}
      />

      {/* Bottom Drawer for Page Settings */}
      <Drawer
        placement="bottom"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        zIndex={100}
        height="80%"
        styles={{
          body: { 
            padding: 0, 
            backgroundColor: 'var(--bg-secondary)',
            height: '100%',
            overflowY: 'auto'
          },
          mask: {
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0,0,0,0.4)'
          },
          wrapper: {
            backgroundColor: 'transparent',
          },
          section: {
            height: '100%',
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
          },
          header: {
            borderBottom: '1px solid var(--border)',
            padding: '16px 24px',
            backgroundColor: 'var(--bg-secondary)'
          }
        }}
        closeIcon={<span className="text-(--text-muted) text-xl">×</span>}
        title={<span className="text-(--text) uppercase tracking-widest font-extrabold text-xs">Page Settings & Configuration</span>}
      >
        <div className=" p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Section 1: Page Identity */}
          <div className="space-y-6">
            <h3 className="text-(--text-muted) text-xs font-bold uppercase tracking-widest border-b border-(--border) pb-2 mb-4">Page Identity</h3>
            <SettingField label="Page Title">
              <input
                className="w-full bg-(--surface) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text) focus:ring-1 focus:ring-(--primary) outline-none"
                defaultValue={page?.title}
                onBlur={(e) => updateTitle(e.target.value)}
                placeholder="e.g. My Awesome Page"
              />
            </SettingField>
            <SettingField label="URL Slug">
              <input
                className="w-full bg-(--surface) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text) focus:ring-1 focus:ring-(--primary) outline-none"
                defaultValue={page?.slug}
                onBlur={(e) => updateSlug(slugify(e.target.value))}
                placeholder="page-slug"
              />
            </SettingField>

            {user && (
              <SettingField label="Page Thumbnail">
                <div className="space-y-3">
                  {page?.thumbnail ? (
                    <div className="relative rounded-xl overflow-hidden border border-(--border) bg-(--surface) group">
                      <img src={page.thumbnail} alt="Thumbnail" className="w-full h-32 object-cover object-top" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => setShowCapturePicker(true)} className="p-2 bg-white/20 blur-sm rounded-lg hover:bg-white/40 transition-colors"><ArrowsRightLeftIcon className="w-5 h-5 text-white" /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl border-2 border-dashed border-(--border) flex flex-col items-center justify-center text-(--text-subtle) space-y-2">
                      <CameraIcon className="w-6 h-6 opacity-40" />
                      <span className="text-[10px] font-medium">No thumbnail set</span>
                    </div>
                  )}
                  <button
                    onClick={() => setShowCapturePicker(true)}
                    className="w-full py-2 bg-(--primary) text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
                  >
                    {page?.thumbnail ? "Change Thumbnail" : "Choose Thumbnail"}
                  </button>
                </div>
              </SettingField>
            )}
          </div>

          {/* Section 2: SEO & Branding */}
          <div className="space-y-6">
            <h3 className="text-(--text-muted) text-xs font-bold uppercase tracking-widest border-b border-(--border) pb-2 mb-4">SEO & Branding</h3>
            <SettingField label="Meta Description">
              <textarea
                className="w-full bg-(--surface) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text) focus:ring-1 focus:ring-(--primary) outline-none resize-none"
                defaultValue={page?.meta?.description || ""}
                onBlur={(e) => updateMeta({ description: e.target.value })}
                rows={3}
                placeholder="Brief description for search engines..."
              />
            </SettingField>

            <SettingField label="Keywords">
              <input
                className="w-full bg-(--surface) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text) focus:ring-1 focus:ring-(--primary) outline-none"
                defaultValue={page?.meta?.keywords || ""}
                onBlur={(e) => updateMeta({ keywords: e.target.value })}
                placeholder="e.g. blog, tech, design"
              />
            </SettingField>

            <div className="grid grid-cols-2 gap-4">
              <SettingField label="Favicon">
                <MediaPreview
                  url={page?.meta?.favicon}
                  onChoose={() => setMediaPickerType("favicon")}
                  onClear={() => updateMeta({ favicon: "" })}
                  label="Favicon"
                  allowRemove={false}
                />
              </SettingField>
              <SettingField label="Social Preview (OG)">
                <MediaPreview
                  url={page?.meta?.ogImage}
                  onChoose={() => setMediaPickerType("ogImage")}
                  onClear={() => updateMeta({ ogImage: "" })}
                  label="OG Image"
                  allowRemove={false}
                />
              </SettingField>
            </div>
          </div>

          {/* Section 3: Global Configuration */}
          <div className="space-y-6">
            <h3 className="text-(--text-muted) text-xs font-bold uppercase tracking-widest border-b border-(--border) pb-2 mb-4">Global Configuration</h3>

            <div className="bg-(--surface) border border-(--border) rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-(--bg-primary) rounded-lg border border-(--border)">
                    {theme.mode === 'dark' ? <MoonIcon className="w-4 h-4 text-blue-400" /> : <SunIcon className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-(--text)">Theme Mode</p>
                    <p className="text-[10px] text-(--text-muted)">Toggle Dark/Light</p>
                  </div>
                </div>
                <Switch
                  checked={theme.mode === 'dark'}
                  onChange={(v) => updateTheme({ mode: v ? 'dark' : 'light' }, true)}
                  size="small"
                />
              </div>

              <div className="h-px bg-(--border)" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-(--bg-primary) rounded-lg border border-(--border)">
                    <div
                      className="w-4 h-4 rounded-full shadow-inner"
                      style={{ backgroundColor: colors.primary }}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-(--text)">Primary Color</p>
                    <p className="text-[10px] text-(--text-muted)">Site accent color</p>
                  </div>
                </div>
                <ColorPicker
                  value={colors.primary}
                  onChange={(v) => updateTheme({ colors: { ...colors, primary: v.toHexString() } })}
                  onOpenChange={(open) => {
                    if (!open) {
                      updateTheme({ colors: { ...colors, primary: colors.primary } }, true);
                      useEditorStore.getState().migrateThemeColors();
                    }
                  }}
                  size="small"
                />
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                <ZapIcon className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-(--text)">One-Click Sync</p>
                <p className="text-[10px] text-(--text-muted) leading-relaxed">Instantly propagate theme changes across all page components.</p>
                <button
                  onClick={() => useEditorStore.getState().migrateThemeColors()}
                  className="mt-2 text-(--primary) text-[10px] font-bold hover:underline"
                >
                  Sync Now &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Access & Visibility */}
          <div className="space-y-6">
            <h3 className="text-(--text-muted) text-xs font-bold uppercase tracking-widest border-b border-(--border) pb-2 mb-4">Access Control</h3>

            <div className="p-4 bg-(--surface) border border-(--border) rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-(--bg-primary) rounded-lg border border-(--border)">
                    {page?.visibility === 'PRIVATE' ? <LockClosedIcon className="w-4 h-4 text-indigo-400" /> : <GlobeAltIcon className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-(--text)">Visibility</p>
                    <p className="text-[10px] text-(--text-muted)">{page?.visibility === 'PRIVATE' ? 'Private (Protected)' : 'Public (Everyone)'}</p>
                  </div>
                </div>
                <Switch
                  checked={page?.visibility === 'PRIVATE'}
                  onChange={(v) => updatePageData({ visibility: v ? 'PRIVATE' : 'PUBLIC' })}
                  size="small"
                />
              </div>

              {page?.visibility === 'PRIVATE' && (
                <div className="pt-2 border-t border-(--border) animate-in fade-in slide-in-from-top-2 duration-300">
                  <SettingField label="Change Password">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full bg-(--bg-primary) border border-(--border) rounded-lg px-3 py-2 pr-10 text-sm text-(--text) focus:ring-1 focus:ring-(--primary) outline-none font-bold"
                        value={page?.password || ""}
                        onChange={(e) => updatePageData({ password: e.target.value })}
                        placeholder="Set new password"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text) transition-colors"
                      >
                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </SettingField>
                </div>
              )}
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg h-fit text-amber-500">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-(--text)">Access Rights</p>
                <p className="text-[10px] text-(--text-muted) leading-relaxed">
                  Private pages are excluded from search engines and require a password to view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
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

function MediaPreview({
  url,
  onChoose,
  onClear,
  label,
  allowRemove = true
}: {
  url?: string;
  onChoose: () => void;
  onClear: () => void;
  label: string;
  allowRemove?: boolean;
}) {
  return (
    <div className="space-y-2">
      {url ? (
        <div className="relative group rounded-lg overflow-hidden border border-(--border) bg-(--surface) aspect-square flex items-center justify-center">
          <img src={url} alt={label} className="w-full h-full object-contain p-2" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={onChoose}
              className="p-1.5 bg-white/20 rounded-md hover:bg-white/30 transition-colors"
              title="Change"
            >
              <ArrowsRightLeftIcon className="w-4 h-4 text-white" />
            </button>
            {allowRemove && <button
              onClick={onClear}
              className="p-1.5 bg-red-500/40 rounded-md hover:bg-red-500/60 transition-colors"
              title="Remove"
            >
              <TrashIcon className="w-4 h-4 text-white" />
            </button>}
          </div>
        </div>
      ) : (
        <button
          onClick={onChoose}
          className="w-full aspect-square rounded-lg border-2 border-dashed border-(--border) hover:border-(--primary) hover:bg-(--surface) transition-all flex flex-col items-center justify-center gap-1.5 text-(--text-subtle)"
        >
          <PhotoIcon className="w-5 h-5 opacity-40" />
          <span className="text-[10px] font-medium">Choose</span>
        </button>
      )}
    </div>
  );
}
