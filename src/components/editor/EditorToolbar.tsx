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
  ChevronDownIcon,
  PlusIcon,
  DocumentIcon,
  SparklesIcon,
  DocumentPlusIcon,
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
import NewPageWizard from "@/components/editor/NewPageWizard";


export default function EditorToolbar() {
  const {
    page, viewMode, isDirty,
    historyIndex, history,
    setViewMode, undo, redo,
    updateTitle, updateSlug, updateMeta, updateTheme, updatePageData, markClean,
    activeRouteId, setActiveRoute, addRoute,
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
  const [showNewPageMenu, setShowNewPageMenu] = useState(false);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

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
      routes: page.routes || [],
      globalBlocks: page.globalBlocks || { header: null, footer: null },
      theme: page.theme || DEFAULT_THEME,
      meta: page.meta || {},
      category: page.category || 'Other',
      status: page.status || 'DRAFT',
      visibility: page.visibility || 'PUBLIC'
    };

    if (thumbnailUrl !== undefined) {
      payload.thumbnail = thumbnailUrl;
    }

    return payload;
  };

  // Fire-and-forget: keep preview cache in sync with every save
  const pushPreviewCache = (payload?: any) => {
    const data = payload || (page ? { ...page } : null);
    if (!data || !pageId || pageId.length < 24) return;
    fetch(`/api/preview/${pageId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
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
        if (!payload || !isDirty) return;
        setIsSaving(true);
        await updateMutation.mutateAsync({ id: pageId, ...payload });
        markClean();
        clearLocalDraft(pageId);
        pushPreviewCache(payload);
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        setIsSaving(false);
      }
    }, 800);

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
      pushPreviewCache(payload);
    } catch (e) {
      console.error("Manual save failed", e);
    } finally {
      setIsSaving(false);
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

  // ── Page Switcher ─────────────────────────────────────────────────────────
  const routes = page?.routes || [];
  const activeRoute = routes.find(r => r.id === activeRouteId) || routes[0];

  const pageMenuItems = [
    {
      key: 'header',
      label: <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", padding: "4px 8px" }}>Screens / Pages</span>,
      disabled: true,
    },
    ...routes.map(r => ({
      key: r.id,
      onClick: () => setActiveRoute(r.id),
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px" }}>
          <DocumentIcon style={{ width: 14, height: 14, opacity: 0.6 }} />
          <span style={{ fontSize: 13, fontWeight: r.id === activeRouteId ? 600 : 400, color: r.id === activeRouteId ? "var(--primary)" : "inherit" }}>
            {r.name}
          </span>
          {r.id === activeRouteId && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)" }} />}
        </div>
      )
    })),
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

        {/* Page Switcher */}
        <Dropdown menu={{ items: pageMenuItems }} trigger={['click']} placement="bottomLeft">
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", height: 32,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
            minWidth: 120, justifyContent: "space-between"
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <DocumentIcon style={{ width: 14, height: 14, color: "var(--primary)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeRoute?.name || "Select Page"}
              </span>
            </div>
            <ChevronDownIcon style={{ width: 12, height: 12, color: "var(--text-muted)" }} />
          </button>
        </Dropdown>

        <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0, margin: "0 4px" }} />
        <BlockPalette />

        {/* ── Add New Page Button ── */}
        <Popover
          open={showNewPageMenu}
          onOpenChange={setShowNewPageMenu}
          trigger="click"
          placement="bottomLeft"
          arrow={false}
          overlayInnerStyle={{ padding: 0, background: "transparent", boxShadow: "none" }}
          content={
            <div style={{
              width: 240,
              background: "linear-gradient(145deg, #0d0d14 0%, #0f0f1a 100%)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
            }}>
              {/* Header */}
              <div style={{
                padding: "14px 16px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(99,102,241,0.06)",
              }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "rgba(165,163,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Add New Page</p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Choose how to start</p>
              </div>

              {/* Option 1: Blank */}
              <button
                onClick={() => {
                  addRoute({ name: `Page ${routes.length + 1}`, path: `/page-${routes.length + 1}` });
                  setShowNewPageMenu(false);
                }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "transparent", border: "none",
                  cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
                  border: "1px solid rgba(99,102,241,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <DocumentPlusIcon style={{ width: 16, height: 16, color: "#818cf8" }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Blank Page</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Start with a clean canvas</p>
                </div>
              </button>

              {/* Option 2: Wizard */}
              <button
                onClick={() => {
                  setShowNewPageMenu(false);
                  setShowWizardModal(true);
                }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "transparent", border: "none",
                  cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(99,102,241,0.1))",
                  border: "1px solid rgba(16,185,129,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <SparklesIcon style={{ width: 16, height: 16, color: "#34d399" }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Use Wizard</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Pick sections to pre-fill</p>
                </div>
              </button>

              {/* Footer hint */}
              <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 500, letterSpacing: "0.04em" }}>
                  {routes.length} page{routes.length !== 1 ? "s" : ""} in this project
                </p>
              </div>
            </div>
          }
        >
          <button
            style={{
              display: "flex", alignItems: "center", gap: 6,
              height: 30, padding: "0 10px",
              background: showNewPageMenu
                ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))"
                : "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))",
              border: `1px solid ${showNewPageMenu ? "rgba(99,102,241,0.6)" : "rgba(99,102,241,0.3)"}`,
              borderRadius: 8, cursor: "pointer",
              color: "#818cf8",
              fontSize: 12, fontWeight: 700,
              letterSpacing: "0.02em",
              transition: "all 0.2s ease",
              boxShadow: showNewPageMenu ? "0 0 12px rgba(99,102,241,0.2)" : "none",
            }}
            onMouseEnter={e => {
              if (!showNewPageMenu) {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(99,102,241,0.15)";
              }
            }}
            onMouseLeave={e => {
              if (!showNewPageMenu) {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <PlusIcon style={{ width: 13, height: 13, strokeWidth: 2.5 }} />
            New Page
            <ChevronDownIcon style={{
              width: 11, height: 11, strokeWidth: 2.5,
              transition: "transform 0.2s",
              transform: showNewPageMenu ? "rotate(180deg)" : "rotate(0deg)",
            }} />
          </button>
        </Popover>
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
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, color: "var(--text-muted)", minWidth: 80 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: isSaving ? "var(--primary)" : isDirty ? "#f59e0b" : "#10b981",
            boxShadow: isSaving ? "0 0 8px var(--primary)" : "none",
            transition: "all 0.2s ease",
            display: "inline-block"
          }} />
          {isSaving ? "Saving..." : isDirty ? "Unsaved" : "Saved"}
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
          className="size-8 bg-violet-700 flex justify-center items-center rounded-full cursor-pointer"
        >
          <EyeIcon style={{ width: 16, height: 16 }} />
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

      {/* New Page Wizard — triggered from header button */}
      <NewPageWizard
        open={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        isSubmitting={isCreatingPage}
        initialStep={2}
        excludeSections={["header", "footer"]}
        onSubmit={async (title, slug, selectedSections) => {
          setIsCreatingPage(true);
          try {
            // First add the new route
            const newPath = slug ? `/${slug}` : `/page-${routes.length + 1}`;
            addRoute({ name: title || `Page ${routes.length + 1}`, path: newPath });

            // Give store a tick to update routes, then add sections to the new route
            await new Promise(r => setTimeout(r, 50));
            const { SECTION_TEMPLATES } = await import("@/lib/config/sections");
            const { injectProjectName } = await import("@/lib/config/blocks");

            const SECTION_ID_MAP: Record<string, string> = {
              header: "nav-", hero: "hero-", features: "features-",
              stats: "stats-", team: "team-", testimonials: "testimonials-",
              pricing: "pricing-", contact: "contact-", cta: "cta-",
              gallery: "gallery-", faq: "faq-", footer: "footer-",
            };

            const sorted = [
              ...selectedSections.filter(id => id === "header"),
              ...selectedSections.filter(id => id !== "header" && id !== "footer"),
              ...selectedSections.filter(id => id === "footer"),
            ];

            const projectName = title || page?.title || "My Page";
            sorted.forEach(id => {
              const prefix = SECTION_ID_MAP[id];
              if (prefix) {
                const template = SECTION_TEMPLATES.find((t: any) => t.id.startsWith(prefix));
                if (template) {
                  const raw = template.create();
                  const migrated = injectProjectName(raw, projectName);
                  useEditorStore.getState().addBlock(migrated);
                }
              }
            });

            setShowWizardModal(false);
          } finally {
            setIsCreatingPage(false);
          }
        }} />

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
